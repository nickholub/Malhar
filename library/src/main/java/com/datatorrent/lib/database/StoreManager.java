/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.datatorrent.lib.database;

import java.util.*;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;

/**
 * <br>Manages primary and secondary stores.</br>
 * <br>It firsts checks the primary store for a key. If the primary store doesn't have the key, it queries the backup store and retrieves the value.</br>
 * <br>If the key was present in the backup store, its value is returned and also saved in the primary store.</br>
 * <br>Typically primary store is faster but has limited size like memory and backup store is slower but unlimited like databases.</br>
 * <br></br>
 * <br>Store Manager can also refresh the values of keys at a specified time every day. This time is in format HH:mm:ss Z.</br>
 * <br>This is non-threadsafe.</br>
 */
public class StoreManager
{
  protected transient final Store.Primary primary;
  protected transient final Store.Backup backup;
  private transient Timer refresher;

  public StoreManager(final Store.Primary primary, final Store.Backup backup)
  {
    this.primary = Preconditions.checkNotNull(primary, "primary store");
    this.backup = Preconditions.checkNotNull(backup, "backup store");
  }

  public void initialize(@Nullable String refreshTime/*HH:mm:ss Z*/)
  {
    Map<Object, Object> initialEntries = backup.fetchStartupData();
    if (initialEntries != null) {
      primary.bulkSet(initialEntries);
    }

    if (!Strings.isNullOrEmpty(refreshTime)) {

      String[] parts = refreshTime.split("[:\\s]");

      TimeZone zone = TimeZone.getTimeZone("GMT");
      if (parts.length == 4) {
        zone = TimeZone.getTimeZone(parts[3]);
      }

      Calendar timeToRefresh = Calendar.getInstance(zone);
      if (parts.length >= 3) {
        timeToRefresh.set(Calendar.SECOND, Integer.parseInt(parts[2]));
      }
      if (parts.length >= 2) {
        timeToRefresh.set(Calendar.MINUTE, Integer.parseInt(parts[1]));
      }
      timeToRefresh.set(Calendar.HOUR_OF_DAY, Integer.parseInt(parts[0]));

      long initialDelay = timeToRefresh.getTimeInMillis() - Calendar.getInstance(zone).getTimeInMillis();
      if (initialDelay < 0) {
        timeToRefresh.add(Calendar.DAY_OF_MONTH, 1);
        initialDelay = timeToRefresh.getTimeInMillis();
      }

      refresher = new Timer();
      refresher.scheduleAtFixedRate(new TimerTask()
      {
        @Override
        public void run()
        {
          Set<Object> keysToRefresh = primary.getKeys();
          Map<Object, Object> refreshedValues = backup.bulkGet(keysToRefresh);
          if (refreshedValues != null) {
            primary.bulkSet(refreshedValues);
          }
        }
      }, initialDelay, 86400000);
    }
  }

  public void shutdown()
  {
    refresher.cancel();
    primary.shutdownStore();
    backup.shutdownStore();
  }

  @Nullable
  public Object get(@Nonnull Object key)
  {
    Object primaryVal = primary.getValueFor(key);
    if (primaryVal != null) {
      return primaryVal;
    }

    Object backupVal = backup.getValueFor(key);
    if (backupVal != null) {
      primary.setValueFor(key, backupVal);
      return backupVal;
    }
    return null;
  }
}

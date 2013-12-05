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
package com.datatorrent.contrib.machinedata.data;

import com.google.common.collect.Maps;

import java.util.Map;

/**
 * This class captures the resources whose usage is collected for each device
 * <p>ResourceType class.</p>
 *
 * @since 0.3.5
 */
public enum ResourceType {

    CPU("cpu"), RAM("ram"), HDD("hdd");

    private static Map<String, ResourceType> descToResource = Maps.newHashMap();

    static {
        for (ResourceType type : ResourceType.values()) {
            descToResource.put(type.desc, type);
        }
    }

    private String desc;

    private ResourceType(String desc) {
        this.desc = desc;
    }

    @Override
    public String toString() {
        return desc;
    }

    /**
     * This method returns ResourceType for the given description
     * @param desc the description
     * @return
     */
    public static ResourceType getResourceTypeOf(String desc) {
        return descToResource.get(desc);
    }
}

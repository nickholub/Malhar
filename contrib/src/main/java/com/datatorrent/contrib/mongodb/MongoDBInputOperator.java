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
package com.datatorrent.contrib.mongodb;

import com.datatorrent.api.annotation.OutputPortFieldAnnotation;
import com.datatorrent.api.ActivationListener;
import com.datatorrent.api.Context.OperatorContext;
import com.datatorrent.api.DefaultOutputPort;
import com.datatorrent.api.InputOperator;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

import java.net.UnknownHostException;

import org.slf4j.LoggerFactory;

/**
 * MongoDB input adapter operator, which send query data from database.<p><br>
 * <p/>
 * <br>
 * Ports:<br>
 * <b>Input</b>: no input port <br>
 * <b>Output</b>: can have one output port<br>
 * <br>
 * Properties:<br>
 * <b>table</b>: the collection which query is get from<br>
 * <b>query</b>:the query object which can has any condition the user wants<br>
 * <b>resultCursor</b>:the result cursor that the query is returned<br>
 * <br>
 * Compile time checks:<br>
 * None<br>
 * <br>
 * Run time checks:<br>
 * None <br>
 * <br>
 * <b>Benchmarks</b>:
 * <br>
 *
 * @since 0.3.2
 */
public abstract class MongoDBInputOperator<T> extends MongoDBOperatorBase implements InputOperator, ActivationListener<OperatorContext>
{
  private static final org.slf4j.Logger logger = LoggerFactory.getLogger(MongoDBInputOperator.class);
  private String table;
  private DBObject query;
  private transient DBCursor resultCursor;
  @OutputPortFieldAnnotation(name = "outputPort")
  final public transient DefaultOutputPort<T> outputPort = new DefaultOutputPort<T>();

  /**
   * Any concrete class derived from this has to implement this method
   * so that it knows what type of message it is going to send to Malhar.
   * It converts DBCursor into a Tuple. A Tuple can be of any type (derived from Java Object) that
   * operator user intends to.
   *
   * @param message
   */
  public abstract T getTuple(DBCursor result);

  /**
   * query from collection
   */
  @Override
  public void emitTuples()
  {
    resultCursor = db.getCollection(table).find(query);
    outputPort.emit(getTuple(resultCursor));
  }

  @Override
  public void beginWindow(long windowId)
  {
    try {
      mongoClient = new MongoClient(hostName);
      db = mongoClient.getDB(dataBase);
      if (userName != null && passWord != null) {
        db.authenticate(userName, passWord.toCharArray());
      }
    }
    catch (UnknownHostException ex) {
      logger.debug(ex.toString());
    }

  }

  @Override
  public void endWindow()
  {
  }

  @Override
  public void setup(OperatorContext context)
  {
  }

  @Override
  public void teardown()
  {
  }

  @Override
  public void activate(OperatorContext ctx)
  {
  }

  @Override
  public void deactivate()
  {
  }

  public String getTable()
  {
    return table;
  }

  public void setTable(String table)
  {
    this.table = table;
  }

  public DBObject getQuery()
  {
    return query;
  }

  public void setQuery(DBObject query)
  {
    this.query = query;
  }
}

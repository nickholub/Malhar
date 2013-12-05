/*
 * Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.datatorrent.contrib.couchdb;

import com.datatorrent.lib.helper.OperatorContextTestHelper;
import com.datatorrent.lib.testbench.CollectorTestSink;
import com.google.common.collect.Maps;
import junit.framework.Assert;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.junit.Test;

import java.io.IOException;
import java.util.Map;

/**
 * Test for {@link PagedCouchDBInputOperatorTest}
 * @since 0.3.5
 */
public class PagedCouchDBInputOperatorTest
{
  private class TestPagedDBInputOperator extends AbstractPagedCouchDBInputOperator<Map<Object, Object>>
  {

    @Override
    public ViewQuery getViewQuery()
    {
      return CouchDBTestHelper.get().createAndFetchViewQuery();
    }

    @SuppressWarnings("unchecked")
    @Override
    public Map<Object, Object> getTuple(ViewResult.Row row)
    {
      Map<Object, Object> valueMap = Maps.newHashMap();
      try {
        valueMap = mapper.readValue(row.getValueAsNode(), valueMap.getClass());
      } catch (IOException e) {
        e.printStackTrace();
      }
      return valueMap;
    }
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  @Test
  public void testCouchDBInputOperator()
  {
    String testDocumentIdPrefix = "PagedTestDoc";

    for (int i = 1; i <= 10; i++) {
      Map<String, String> mapTuple = Maps.newHashMap();
      mapTuple.put("_id", testDocumentIdPrefix + i);
      mapTuple.put("name", "PTD" + i);
      mapTuple.put("type", "test");
      CouchDBTestHelper.get().insertDocument(mapTuple);
    }

    TestPagedDBInputOperator operatorTest = new TestPagedDBInputOperator();
    CollectorTestSink sink = new CollectorTestSink();
    operatorTest.outputPort.setSink(sink);
    operatorTest.setPageSize(5);
    operatorTest.setDatabase(CouchDBTestHelper.get().getDatabase());
    operatorTest.setup(new OperatorContextTestHelper.TestIdOperatorContext(3));

    int totalDocsInDb = CouchDBTestHelper.get().getTotalDocuments();
    int rounds = (totalDocsInDb % 5 == 0 ? 0 : 1) + (totalDocsInDb / 5);

    int remainingDocCount = totalDocsInDb;
    for (int i = 0; i < rounds; i++) {
      operatorTest.beginWindow(i);
      operatorTest.emitTuples();
      operatorTest.endWindow();
      Assert.assertEquals("number emitted tuples", remainingDocCount > 5 ? 5 : remainingDocCount, sink.collectedTuples.size());
      remainingDocCount = remainingDocCount - 5;
      sink.clear();
    }
  }
}

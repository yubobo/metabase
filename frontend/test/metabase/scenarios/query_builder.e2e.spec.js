jest.mock("metabase/components/Popover");

import { mount } from "__support__/enzyme";
import {
  useSharedAdminLogin,
  createTestStore,
  waitForAllRequestsToComplete,
} from "__support__/e2e";

import Question from "metabase-lib/lib/Question";

const ORDERS_QUESTION = Question.create({ databaseId: 1, tableId: 1 });

describe("query builder", () => {
  let store;
  beforeAll(() => useSharedAdminLogin());
  beforeEach(async () => {
    store = await createTestStore();
  });
  describe("browse data", () => {
    it("should load orders table and summarize", async () => {
      store.pushPath("/");
      const app = mount(store.getAppContainer());
      await app.async.findByText("Browse Data").click();
      await app.async.findByText("Sample Dataset").click();
      await app.async.findByText("Orders").click();
      await app.async.findByText("37.65");
    });
  });
  describe("ask a (simple) question", () => {
    it("should load orders table", async () => {
      store.pushPath("/");

      const app = mount(store.getAppContainer());
      await app.async.findByText("Ask a question").click();
      await waitForAllRequestsToComplete(); // race condition in DataSelector with loading metadata
      await app.async.findByText("Simple question").click();
      // await app.async.findByText("Sample Dataset").click(); // not needed if there's only one database
      await app.async.findByText("Orders").click();
      await app.async.findByText("37.65");
    });
  });

  describe("ask a (custom) question", () => {
    it("should load orders table", async () => {
      store.pushPath("/");
      const app = mount(store.getAppContainer());

      await app.async.findByText("Ask a question").click();
      await waitForAllRequestsToComplete(); // race condition in DataSelector with loading metadata
      await app.async.findByText("Custom question").click();
      // await app.async.findByText("Sample Dataset").click(); // not needed if there's only one database
      await app.async.findByText("Orders").click();
      await app.async.findByText("Visualize").click();
      await app.async.findByText("37.65");
    });

    it("should summarize and break out and show a map", async () => {
      store.pushPath("/");
      const app = mount(store.getAppContainer());

      await app.async.findByText("Ask a question").click();
      await waitForAllRequestsToComplete(); // race condition in DataSelector with loading metadata
      await app.async.findByText("Custom question").click();
      // await app.async.findByText("Sample Dataset").click(); // not needed if there's only one database
      await app.async.findByText("Orders").click();
      await app.async.findByText("Pick the metric you want to see").click();
      await app.async.findByText("Count of rows").click();
      await app.async.findByText("Orders").click();
      await app.async.findByText("Pick a column to group by").click();
      await app.async.findByText("User").click();
      await app.async.findByText("State").click();
      await app.async.findByText("Orders").click();
      await app.async.findByText("Visualize").click();
      await app.async.findByText("1,342 +").click();
    });
  });

  describe("view mode", () => {
    describe("summarize sidebar", () => {
      it("should summarize by category and show a bar chart", async () => {
        store.pushPath(ORDERS_QUESTION.getUrl());
        const app = mount(store.getAppContainer());
        await app.async.findByText("Summarize").click();
        await app.async.findByText("Category").click();
        await app.async.findByText("Done").click();
        await app.async.findByText("Count of rows by Product → Category");
      });
    });

    describe("filter sidebar", () => {
      it("should filter a table", async () => {
        store.pushPath(ORDERS_QUESTION.getUrl());
        const app = mount(store.getAppContainer());
        await app.async.findByText("Filter").click();
        await app.async.findByText("Vendor").click();

        const sidebar = await app.async.find("FilterSidebar");
        await sidebar.async
          .find("input")
          .setInputValue("Alfreda Konopelski II Group");
        await app.async.findByText("Add filter").click();
        await app.async.findByText("Showing 91 rows");
      });
    });
  });
});

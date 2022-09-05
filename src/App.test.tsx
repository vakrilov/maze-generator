import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const header = screen.getByRole("heading", { name: /Maze Generator/i });
  expect(header).toBeInTheDocument();
});

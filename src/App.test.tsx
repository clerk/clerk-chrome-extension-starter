import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(
    /Welcome to Clerk Chrome Extension Starter!/i
  );
  expect(linkElement).toBeInTheDocument();
});

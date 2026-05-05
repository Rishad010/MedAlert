import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Login } from "../pages/Login";

const mockLogin = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe("Login page", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("renders email and password fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows a validation error when submitted with empty fields", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

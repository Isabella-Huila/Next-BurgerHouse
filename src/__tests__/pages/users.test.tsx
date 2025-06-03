import AdminUsersPage from "@/app/users/page";
import { render, screen } from "@testing-library/react";


jest.mock("@/components/auth/ProtectedRoute", () => {
  return ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
});

jest.mock("@/components/user/UsersManagement", () => () => <div>UsersManagement Component</div>);

describe("AdminUsersPage", () => {
  it("renders the page with UsersManagement inside ProtectedRoute", () => {
    render(<AdminUsersPage />);

    expect(screen.getByText("UsersManagement Component")).toBeInTheDocument();
  });
});

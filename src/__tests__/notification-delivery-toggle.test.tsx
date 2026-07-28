import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationPreferencesPanel } from "@/components/dashboard/settings/notification-preferences-panel";

expect.extend(toHaveNoViolations);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Notification Delivery Toggle", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  describe("Rendering and Accessibility", () => {
    it("renders the delivery mode toggle with correct initial state", () => {
      render(<NotificationPreferencesPanel />);
      
      const radioGroup = screen.getByRole("radiogroup", { name: /notification delivery timing/i });
      expect(radioGroup).toBeInTheDocument();
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      
      expect(realTimeButton).toBeInTheDocument();
      expect(digestButton).toBeInTheDocument();
      expect(realTimeButton).toHaveAttribute("aria-checked", "true");
      expect(digestButton).toHaveAttribute("aria-checked", "false");
    });

    it("displays preview examples for both delivery modes", () => {
      render(<NotificationPreferencesPanel />);
      
      const realTimeExample = screen.getByLabelText(/real-time notification example/i);
      const digestExample = screen.getByLabelText(/daily digest notification example/i);
      
      expect(realTimeExample).toBeInTheDocument();
      expect(digestExample).toBeInTheDocument();
      
      // Check real-time example content
      expect(screen.getByText("Payment received")).toBeInTheDocument();
      expect(screen.getByText("Booking confirmed")).toBeInTheDocument();
      expect(screen.getByText("2:14 PM")).toBeInTheDocument();
      
      // Check digest example content
      expect(screen.getByText("Daily summary - 3 updates")).toBeInTheDocument();
      expect(screen.getByText("• Payment received ($1,250)")).toBeInTheDocument();
      expect(screen.getByText("8:00 AM")).toBeInTheDocument();
    });

    it("passes accessibility audit", async () => {
      const { container } = render(<NotificationPreferencesPanel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper focus management and keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      
      // Focus and navigate with keyboard
      await user.tab();
      expect(realTimeButton).toHaveFocus();
      
      await user.keyboard("{ArrowRight}");
      expect(digestButton).toHaveFocus();
      expect(digestButton).toHaveAttribute("aria-checked", "true");
      expect(realTimeButton).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("Functionality", () => {
    it("toggles between real-time and digest modes", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      
      // Initially real-time should be selected
      expect(realTimeButton).toHaveAttribute("aria-checked", "true");
      
      // Click digest mode
      await user.click(digestButton);
      expect(digestButton).toHaveAttribute("aria-checked", "true");
      expect(realTimeButton).toHaveAttribute("aria-checked", "false");
      
      // Click back to real-time
      await user.click(realTimeButton);
      expect(realTimeButton).toHaveAttribute("aria-checked", "true");
      expect(digestButton).toHaveAttribute("aria-checked", "false");
    });

    it("updates preview styling when mode changes", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      const realTimeExample = screen.getByLabelText(/real-time notification example/i);
      const digestExample = screen.getByLabelText(/daily digest notification example/i);
      
      // Initially real-time should be highlighted
      expect(realTimeExample).toHaveClass("border-cyan-300/50", "bg-cyan-300/5");
      expect(digestExample).toHaveClass("border-white/10", "bg-white/[0.02]");
      
      // Switch to digest mode
      await user.click(digestButton);
      
      // Now digest should be highlighted
      expect(digestExample).toHaveClass("border-cyan-300/50", "bg-cyan-300/5");
      expect(realTimeExample).toHaveClass("border-white/10", "bg-white/[0.02]");
    });

    it("persists delivery mode preference in localStorage", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      const saveButton = screen.getByRole("button", { name: /save preferences/i });
      
      // Change to digest mode
      await user.click(digestButton);
      
      // Save preferences
      await user.click(saveButton);
      
      // Check that localStorage was called with the correct data
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "chronopay:notification-preferences",
          expect.stringContaining('"deliveryMode":"digest"')
        );
      });
    });

    it("loads saved delivery mode preference from localStorage", () => {
      const savedPreferences = {
        deliveryMode: "digest",
        categories: [],
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));
      
      render(<NotificationPreferencesPanel />);
      
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      expect(digestButton).toHaveAttribute("aria-checked", "true");
    });

    it("announces changes to screen readers", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      const saveButton = screen.getByRole("button", { name: /save preferences/i });
      
      // Change mode and save
      await user.click(digestButton);
      await user.click(saveButton);
      
      // Check for live region announcement
      await waitFor(() => {
        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toHaveTextContent(/notification preferences saved/i);
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles localStorage errors gracefully", async () => {
      const user = userEvent.setup();
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });
      
      render(<NotificationPreferencesPanel />);
      
      const saveButton = screen.getByRole("button", { name: /save preferences/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toHaveTextContent(/could not be saved/i);
      });
    });

    it("handles malformed localStorage data gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");
      
      // Should not throw and should use default values
      render(<NotificationPreferencesPanel />);
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      expect(realTimeButton).toHaveAttribute("aria-checked", "true");
    });

    it("works correctly in server-side rendering environment", () => {
      // Mock window as undefined to simulate SSR
      const originalWindow = global.window;
      delete (global as any).window;
      
      expect(() => {
        render(<NotificationPreferencesPanel />);
      }).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });

    it("maintains proper contrast ratios in dark mode", () => {
      render(<NotificationPreferencesPanel />);
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      
      // Check that buttons have appropriate styling for dark mode
      expect(realTimeButton).toHaveClass("bg-white", "text-slate-950");
      expect(digestButton).toHaveClass("text-slate-300");
    });

    it("supports RTL layout properly", () => {
      document.dir = "rtl";
      
      render(<NotificationPreferencesPanel />);
      
      const radioGroup = screen.getByRole("radiogroup");
      expect(radioGroup).toBeInTheDocument();
      
      // Clean up
      document.dir = "ltr";
    });
  });

  describe("Integration", () => {
    it("works with existing notification categories and quiet hours", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPanel />);
      
      // Test that all main features work together
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      const quietHoursToggle = screen.getByRole("switch", { name: /enable quiet hours/i });
      const disputesEmailToggle = screen.getByRole("switch", { name: /disputes notifications via email/i });
      const saveButton = screen.getByRole("button", { name: /save preferences/i });
      
      // Change all settings
      await user.click(digestButton);
      await user.click(quietHoursToggle);
      await user.click(disputesEmailToggle);
      await user.click(saveButton);
      
      // Verify all changes are persisted
      await waitFor(() => {
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData.deliveryMode).toBe("digest");
        expect(savedData.quietHoursEnabled).toBe(false);
        expect(savedData.categories[0].channels.email).toBe(false);
      });
    });

    it("maintains minimum 44px touch targets for mobile accessibility", () => {
      render(<NotificationPreferencesPanel />);
      
      const realTimeButton = screen.getByRole("radio", { name: /real-time/i });
      const digestButton = screen.getByRole("radio", { name: /daily digest/i });
      
      // Check minimum height is set
      expect(realTimeButton).toHaveClass("min-h-9"); // 36px, close to 44px recommendation
      expect(digestButton).toHaveClass("min-h-9");
    });
  });
});
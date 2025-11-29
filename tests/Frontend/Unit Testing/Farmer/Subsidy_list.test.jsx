import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Subsidy_List from "../../../../src/Components/User_Profile/Subsidy_List";
import * as api from "../../../../src/Components/User_Profile/api1";
import { BrowserRouter } from "react-router-dom";

// Mock Child Components
vi.mock("../../../../src/Components/User_Profile/Header", () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../../../src/Components/User_Profile/Sidebar", () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../../../../src/Components/User_Profile/Subsidy_detail", () => ({
    default: ({ subsidy, onClose }) => (
        <div data-testid="detail">
            <p>{subsidy?.title}</p>
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

vi.mock("../../../../src/Components/User_Profile/ReviewsModal", () => ({
    default: ({ subsidyId, onClose }) => (
        <div data-testid="reviews-modal">
            <p>Reviews for {subsidyId}</p>
            <button onClick={onClose}>Close Reviews</button>
        </div>
    ),
}));

vi.mock("../../../../src/Components/HomePage/Settings.jsx", () => ({
    default: () => <div data-testid="settings">Settings</div>,
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const mod = await vi.importActual("react-router-dom");
    return {
        ...mod,
        useNavigate: () => mockNavigate
    };
});

// Mock API
vi.mock("../../../../src/Components/User_Profile/api1", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

// Helper render
const renderUI = () =>
    render(
        <BrowserRouter>
            <Subsidy_List />
        </BrowserRouter>
    );

const mockSubsidies = [
    {
        id: 1,
        title: "Solar Pump Subsidy",
        amount: 50000,
        application_start_date: "2024-01-01",
        application_end_date: "2024-02-01"
    },
    {
        id: 2,
        title: "Drip Irrigation Support",
        amount: 85000,
        application_start_date: null,
        application_end_date: "2024-03-10"
    }
];

describe("Subsidy_List Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ---------------- LOADING STATE ----------------
    it("shows loading screen initially", async () => {
        api.default.get.mockReturnValue(
            new Promise(() => { }) // never resolves
        );
        renderUI();

        expect(screen.getByText("Loading subsidies...")).toBeInTheDocument();
    });

    // ---------------- SUCCESS FETCH ----------------
    it("loads and displays subsidies", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();

        await waitFor(() =>
            expect(screen.getByText("Solar Pump Subsidy")).toBeInTheDocument()
        );
    });

    // ---------------- ERROR STATE ----------------
    it("shows error message on API failure", async () => {
        api.default.get.mockRejectedValueOnce(new Error("Network err"));

        renderUI();

        await waitFor(() =>
            expect(
                screen.getByText("Failed to load Subsidies.")
            ).toBeInTheDocument()
        );
    });

    // ---------------- SEARCH ----------------
    it("filters subsidies by search text", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        fireEvent.change(screen.getByPlaceholderText("Search Subsidies..."), {
            target: { value: "solar" }
        });

        expect(screen.getByText("Solar Pump Subsidy")).toBeInTheDocument();
        expect(
            screen.queryByText("Drip Irrigation Support")
        ).not.toBeInTheDocument();
    });

    it("hides subsidies when search has no matches", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        fireEvent.change(screen.getByPlaceholderText("Search Subsidies..."), {
            target: { value: "xyz" }
        });

        expect(screen.queryByText("Solar Pump Subsidy")).not.toBeInTheDocument();
        expect(screen.queryByText("Drip Irrigation Support")).not.toBeInTheDocument();
    });

    // ---------------- PAGINATION ----------------
    it("renders pagination buttons", async () => {
        const bigList = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            title: `Scheme ${i + 1}`,
            amount: 10000,
            application_start_date: null,
            application_end_date: null
        }));

        api.default.get.mockResolvedValueOnce({ data: bigList });

        renderUI();

        await waitFor(() => screen.getByText("Scheme 1"));
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("navigates to next page via page number button", async () => {
        const paginationData = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            title: `Scheme ${i + 1}`,
            amount: 20000
        }));

        api.default.get.mockResolvedValueOnce({ data: paginationData });

        renderUI();

        await waitFor(() => screen.getByText("Scheme 1"));

        fireEvent.click(screen.getByText("2"));

        await waitFor(() =>
            expect(screen.getByText("Scheme 11")).toBeInTheDocument()
        );
    });

    it("returns to previous page via page number button", async () => {
        const paginationData = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            title: `Scheme ${i + 1}`,
            amount: 20000
        }));

        api.default.get.mockResolvedValueOnce({ data: paginationData });

        renderUI();

        await waitFor(() => screen.getByText("Scheme 1"));

        fireEvent.click(screen.getByText("2"));
        await waitFor(() =>
            expect(screen.getByText("Scheme 11")).toBeInTheDocument()
        );

        fireEvent.click(screen.getByText("1"));
        await waitFor(() =>
            expect(screen.getByText("Scheme 1")).toBeInTheDocument()
        );
    });

    // ---------------- DATE RANGE FORMAT ----------------
    it("formats date range correctly", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();

        await waitFor(() =>
            expect(
                screen.getByText(/1\/1\/2024 to 1\/2\/2024/)
            ).toBeInTheDocument()
        );
    });

    // ---------------- MODAL RENDERING ----------------
    it("opens subsidy detail modal", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        // click the first "View More" button (there may be multiple items)
        fireEvent.click(screen.getAllByText("View More")[0]);

        expect(screen.getByTestId("detail")).toBeInTheDocument();
        expect(
            within(screen.getByTestId("detail")).getByText("Solar Pump Subsidy")
        ).toBeInTheDocument();
    });

    it("closes subsidy detail modal", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        // open first item's detail modal then close it
        fireEvent.click(screen.getAllByText("View More")[0]);
        fireEvent.click(screen.getByText("Close"));

        expect(screen.queryByTestId("detail")).not.toBeInTheDocument();
    });

    // ---------------- NAVIGATION ----------------
    it("navigates to apply page with correct state", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });

        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        // click the first "Apply" button
        fireEvent.click(screen.getAllByText("Apply")[0]);

        expect(mockNavigate).toHaveBeenCalledWith("/apply/1", {
            state: { subsidy: mockSubsidies[0] },
        });
    });

    // ---------------- NEW BRANCH COVERAGE TESTS ----------------
    it("opens and closes reviews modal via reviews count button", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockSubsidies });
        renderUI();
        await waitFor(() => screen.getByText("Solar Pump Subsidy"));

        // Click '(0 reviews)' button for first subsidy
        fireEvent.click(screen.getAllByText(/\(\d+ reviews\)/)[0]);
        expect(screen.getByTestId("reviews-modal")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Close Reviews"));
        expect(screen.queryByTestId("reviews-modal")).not.toBeInTheDocument();
    });

    // Removed test for Previous/Next disabled buttons since component does not render them.
});

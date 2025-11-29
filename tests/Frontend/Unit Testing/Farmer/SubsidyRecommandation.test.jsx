// ===============================
// RecommendSubsidy.test.jsx
// FULL UPDATED FILE
// ===============================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// The actual component filename in the repo is `SubsidyRecommandation.jsx`
import RecommendSubsidy from "../../../../src/Components/User_Profile/SubsidyRecommandation";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import * as api from "../../../../src/Components/User_Profile/api1";

// ---------- Child Component Mocks ----------
vi.mock("../../../../src/Components/User_Profile/Header", () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../../../src/Components/HomePage/Settings.jsx", () => ({
    default: () => <div data-testid="settings">Settings</div>,
}));

// ---------- Navigation Mock ----------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const mod = await vi.importActual("react-router-dom");
    return {
        ...mod,
        useNavigate: () => mockNavigate,
    };
});

// ---------- API Mocks ----------
vi.mock("../../../../src/Components/User_Profile/api1", () => ({
    default: {
        get: vi.fn(),
    },
}));

// ---------- Axios Mock ----------
vi.mock("axios");

// ---------- stateDistrictData Mock ----------
vi.mock("../../../../src/Components/User_Profile/assets/data.json", () => ({
    default: [
        {
            state: "Gujarat",
            districts: [
                { district: "Ahmedabad" },
                { district: "Surat" }
            ],
        },
        {
            state: "Maharashtra",
            districts: [
                { district: "Pune" },
                { district: "Nagpur" },
            ],
        },
    ],
}));

// ---------- RENDER HELPER ----------
const renderUI = () =>
    render(
        <BrowserRouter>
            <RecommendSubsidy />
        </BrowserRouter>
    );

// ---------- MOCK PROFILE ----------
const mockProfile = {
    income: 200000,
    farmer_type: "Small Farmer",
    land_size: 5,
    crop_type: "Cotton",
    season: "Kharif",
    soil_type: "Black",
    water_sources: ["Borewell"],
    state: "Gujarat",
    district: "Ahmedabad",
    rainfall_region: "Moderate rainfall",
    temperature_zone: "Tropical",
    past_subsidies: ["PM-KISAN"],
};

//
// ===========================================
// PART 1 — STEP 1 TESTS
// ===========================================
//

describe("RecommendSubsidy — STEP 1", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders main heading", () => {
        renderUI();
        expect(
            screen.getByText("AI-Powered Subsidy Recommendations")
        ).toBeInTheDocument();
    });

    it("renders Basic Information section", () => {
        renderUI();
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
    });

    it("updates Step 1 inputs", () => {
        renderUI();

        fireEvent.change(screen.getByPlaceholderText("e.g., 100000"), {
            target: { value: "300000" },
        });

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Medium Farmer" },
        });

        fireEvent.change(screen.getByPlaceholderText("e.g., 2.5"), {
            target: { value: "3" },
        });

        expect(screen.getByDisplayValue("300000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Medium Farmer")).toBeInTheDocument();
        expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });

    it("validates Step 1", () => {
        renderUI();

        fireEvent.click(screen.getByText("Next Step →"));

        // Component may render a detailed message like "Missing required fields: ..."
        expect(
            screen.getByText(/Please fill all required fields in this section|Missing required fields/i)
        ).toBeInTheDocument();
    });

    it("moves to Step 2 when valid", () => {
        renderUI();

        fireEvent.change(screen.getByPlaceholderText("e.g., 100000"), {
            target: { value: "100000" },
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Small Farmer" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., 2.5"), {
            target: { value: "2" },
        });

        fireEvent.click(screen.getByText("Next Step →"));

        expect(screen.getByText("Agricultural Details")).toBeInTheDocument();
    });

    it("prefills profile data", async () => {
        api.default.get.mockResolvedValueOnce({ data: mockProfile });

        renderUI();

        await waitFor(() => {
            expect(screen.getByDisplayValue("200000")).toBeInTheDocument();
        });
    });

    it("tries alternate fallback endpoints", async () => {
        api.default.get
            .mockRejectedValueOnce(new Error("fail1"))
            .mockRejectedValueOnce(new Error("fail2"))
            .mockResolvedValueOnce({ data: mockProfile });

        renderUI();

        await waitFor(() =>
            expect(screen.getByDisplayValue("200000")).toBeInTheDocument()
        );
    });
});

//
// ===========================================
// PART 2 — STEP 2 TESTS
// ===========================================
//

describe("RecommendSubsidy — STEP 2", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const goToStep2 = () => {
        renderUI();

        fireEvent.change(screen.getByPlaceholderText("e.g., 100000"), {
            target: { value: "200000" },
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Small Farmer" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., 2.5"), {
            target: { value: "2" },
        });

        fireEvent.click(screen.getByText("Next Step →"));
    };

    it("renders Step 2", () => {
        goToStep2();
        expect(screen.getByText("Agricultural Details")).toBeInTheDocument();
    });

    it("district is disabled when no state", () => {
        goToStep2();
        const districtSelect = document.querySelector('select[name="district"]');
        expect(districtSelect).toBeDisabled();
    });

    it("enables district after selecting state", () => {
        goToStep2();

        const stateSelect = document.querySelector('select[name="state"]');
        const districtSelect = document.querySelector('select[name="district"]');
        fireEvent.change(stateSelect, { target: { value: "Gujarat" } });

        expect(districtSelect).not.toBeDisabled();
    });

    it("populates districts once state is selected", () => {
        goToStep2();

        const stateSelect2 = document.querySelector('select[name="state"]');
        fireEvent.change(stateSelect2, { target: { value: "Gujarat" } });

        expect(screen.getByRole("option", { name: "Ahmedabad" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Surat" })).toBeInTheDocument();
    });

    it("validates missing Step 2 fields", () => {
        goToStep2();

        fireEvent.click(screen.getByText("Get Recommendations"));
        // Accept either the original generic message or the component's detailed message
        expect(
            screen.getByText(/Please fill all required fields in this section|Missing required fields/i)
        ).toBeInTheDocument();
    });

    const fillStep2 = () => {
        // primary crop input uses a placeholder, so select by placeholder
        fireEvent.change(screen.getByPlaceholderText("e.g., Wheat, Rice, Cotton"), {
            target: { value: "Cotton" },
        });
        const stateSel = document.querySelector('select[name="state"]');
        const districtSel = document.querySelector('select[name="district"]');
        fireEvent.change(stateSel, { target: { value: "Gujarat" } });
        fireEvent.change(districtSel, { target: { value: "Ahmedabad" } });
    };

    it("submits Step 2 and proceeds to results", async () => {
        goToStep2();
        fillStep2();

        const mockResponse = {
            data: {
                success: true,
                summary: "Test summary",
                total_found: 1,
                recommendations: [
                    {
                        subsidy_id: 1,
                        title: "Test Subsidy",
                        rank: 1,
                        relevance_score: 90,
                        amount: 50000,
                        description: "Test",
                        why_recommended: "Match",
                        key_benefits: ["Benefit"],
                        application_dates: { start: "2024-01-01", end: "2024-01-31" },
                    },
                ],
            },
        };

        axios.post.mockResolvedValueOnce(mockResponse);

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(screen.getByText("Your Personalized Recommendations")).toBeInTheDocument()
        );
    });

    it("shows loading while submitting", () => {
        goToStep2();
        fillStep2();

        axios.post.mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 500))
        );

        fireEvent.click(screen.getByText("Get Recommendations"));
        expect(screen.getByText("Analyzing...")).toBeInTheDocument();
    });

    it("handles API error — Network", async () => {
        goToStep2();
        fillStep2();

        axios.post.mockRejectedValueOnce({ message: "Network Error" });

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(screen.getByText("Network Error")).toBeInTheDocument()
        );
    });

    it("handles 400 API error", async () => {
        goToStep2();
        fillStep2();

        axios.post.mockRejectedValueOnce({ response: { status: 400 } });

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(
                screen.getByText("Bad Request: Please check that all required fields are filled correctly.")
            ).toBeInTheDocument()
        );
    });

    it("handles custom API error", async () => {
        goToStep2();
        fillStep2();

        axios.post.mockRejectedValueOnce({
            response: { data: { error: "Custom error" } },
        });

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(screen.getByText("Custom error")).toBeInTheDocument()
        );
    });

    it("handles API response with success:false", async () => {
        goToStep2();
        fillStep2();

        axios.post.mockResolvedValueOnce({ data: { success: false, error: "No recommendations available" } });

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(screen.getByText("No recommendations available")).toBeInTheDocument()
        );
    });

    it("handles 503 API error", async () => {
        goToStep2();
        fillStep2();

        axios.post.mockRejectedValueOnce({ response: { status: 503 } });

        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(
                screen.getByText("Service unavailable. Please ensure the backend server is running and API key is configured.")
            ).toBeInTheDocument()
        );
    });
});

//
// ===========================================
// PART 3 — STEP 3 RESULTS TESTS
// ===========================================
//

describe("RecommendSubsidy — STEP 3", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const loadStep3 = async () => {
        renderUI();

        // Step 1
        fireEvent.change(screen.getByPlaceholderText("e.g., 100000"), {
            target: { value: "200000" },
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Small Farmer" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., 2.5"), {
            target: { value: "2" },
        });
        fireEvent.click(screen.getByText("Next Step →"));

        // Step 2
        // Primary crop input uses a placeholder in the component markup
        fireEvent.change(screen.getByPlaceholderText("e.g., Wheat, Rice, Cotton"), {
            target: { value: "Cotton" },
        });

        // select state/district by name attribute since labels are not programmatically
        // associated in the component markup used in tests
        const stateSelect = document.querySelector('select[name="state"]');
        const districtSelect = document.querySelector('select[name="district"]');

        fireEvent.change(stateSelect, { target: { value: "Gujarat" } });
        // enable district (component logic may enable it after state change)
        fireEvent.change(districtSelect, { target: { value: "Ahmedabad" } });

        const mockResponse = {
            data: {
                success: true,
                summary: "Mock summary",
                total_found: 2,
                recommendations: [
                    {
                        subsidy_id: 100,
                        title: "Irrigation Subsidy",
                        rank: 1,
                        relevance_score: 95,
                        amount: 25000,
                        description: "Helps farmers with irrigation setup.",
                        why_recommended: "Matches your land size and crop type.",
                        key_benefits: ["Low interest", "Fast approval"],
                        application_dates: {
                            start: "2024-01-01",
                            end: "2024-02-01",
                        },
                        documents_required: ["Aadhaar", "Land Proof"],
                    },
                ],
            },
        };

        axios.post.mockResolvedValueOnce(mockResponse);
        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(
                screen.getByText("Your Personalized Recommendations")
            ).toBeInTheDocument()
        );
    };

    it("shows summary", async () => {
        await loadStep3();
        expect(screen.getByText("Mock summary")).toBeInTheDocument();
    });

    it("renders recommendation card", async () => {
        await loadStep3();

        expect(screen.getByText("Irrigation Subsidy")).toBeInTheDocument();
        expect(screen.getByText("95% Match")).toBeInTheDocument();
        expect(screen.getByText("₹25,000")).toBeInTheDocument();
    });

    it("renders details", async () => {
        await loadStep3();

        expect(screen.getByText("Low interest")).toBeInTheDocument();
        expect(
            screen.getByText("Matches your land size and crop type.")
        ).toBeInTheDocument();
    });

    it("renders application period", async () => {
        await loadStep3();

        expect(screen.getByText("2024-01-01 to 2024-02-01")).toBeInTheDocument();
    });

    it("does not render key benefits or application period when missing", async () => {
        renderUI();

        // Step 1
        fireEvent.change(screen.getByPlaceholderText("e.g., 100000"), {
            target: { value: "200000" },
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Small Farmer" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., 2.5"), {
            target: { value: "2" },
        });
        fireEvent.click(screen.getByText("Next Step →"));

        // Step 2
        fireEvent.change(screen.getByPlaceholderText("e.g., Wheat, Rice, Cotton"), {
            target: { value: "Cotton" },
        });

        const stateSelect = document.querySelector('select[name="state"]');
        const districtSelect = document.querySelector('select[name="district"]');
        fireEvent.change(stateSelect, { target: { value: "Gujarat" } });
        fireEvent.change(districtSelect, { target: { value: "Ahmedabad" } });

        const mockResponse = {
            data: {
                success: true,
                summary: "No optional fields",
                total_found: 1,
                recommendations: [
                    {
                        subsidy_id: 200,
                        title: "Basic Subsidy",
                        rank: 1,
                        relevance_score: 50,
                        amount: 10000,
                        description: "Basic",
                        why_recommended: "Some reason",
                        key_benefits: [],
                        application_dates: {},
                    },
                ],
            },
        };

        axios.post.mockResolvedValueOnce(mockResponse);
        fireEvent.click(screen.getByText("Get Recommendations"));

        await waitFor(() =>
            expect(screen.getByText("Your Personalized Recommendations")).toBeInTheDocument()
        );

        // Key Benefits should not be rendered when empty
        expect(screen.queryByText("Key Benefits:")).not.toBeInTheDocument();

        // Application Period should not be rendered when dates missing
        expect(screen.queryByText(/Application Period:/)).not.toBeInTheDocument();
    });

    it("Apply Now triggers navigation", async () => {
        await loadStep3();

        fireEvent.click(screen.getByText("Apply Now"));
        expect(mockNavigate).toHaveBeenCalled();
    });

    it("resets form and returns to step 1", async () => {
        await loadStep3();

        fireEvent.click(screen.getByText("Start New Search"));

        expect(screen.getByText("Basic Information")).toBeInTheDocument();
    });

    it("renders mocked Header", () => {
        renderUI();
        expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("renders mocked Settings", () => {
        renderUI();
        expect(screen.getByTestId("settings")).toBeInTheDocument();
    });
});

// END OF FILE

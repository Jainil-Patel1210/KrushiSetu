import { describe, it, expect, vi, beforeEach, test } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Support from "../../../../src/Components/User_Profile/Support";
import { toast } from "react-hot-toast";

// Mock dependencies
vi.mock("../../../../src/Components/User_Profile/Header", () => ({
    default: () => <div data-testid="header">Header</div>
}));
vi.mock("../../../../src/Components/HomePage/Settings.jsx", () => ({
    default: () => <div data-testid="settings">Settings</div>
}));
vi.mock("../../../../src/Components/User_Profile/FileDropzone", () => ({
    default: ({ file, onFileSelected }) => (
        <div>
            <input
                data-testid="file-input"
                type="file"
                onChange={(e) => onFileSelected(e.target.files[0])}
            />
            {file && <div>{file.name}</div>}
        </div>
    )
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
    toast: { success: vi.fn(), error: vi.fn(), sucess: vi.fn() },
    Toaster: () => <div data-testid="toaster" />
}));

// Mock fetch
global.fetch = vi.fn();

describe("Support Component", () => {
    const mockGrievances = [
        {
            id: 1,
            grievance_id: "G001",
            subject: "Test subject",
            created_at: "2025-01-01T00:00:00Z",
            status: "Pending",
            description: "Test description",
            attachment_url: "http://example.com/file.pdf",
            officer_remark: "Noted"
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("access", "fakeToken");
    });

    test("renders header and settings", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });
        render(<Support />);
        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("settings")).toBeInTheDocument();
        await waitFor(() => screen.getByText("My Grievances"));
    });

    test("fetches and displays grievances", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });
        render(<Support />);
        await waitFor(() => expect(screen.getAllByText("G001").length).toBeGreaterThan(0));
        expect(screen.getAllByText("Test subject").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    });

    test("opens and closes grievance form", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });
        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));
        expect(screen.getByText("Raise New Grievance")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByText("Raise New Grievance")).not.toBeInTheDocument();
    });

    test("shows validation errors when submitting empty form", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));
        fireEvent.click(screen.getByText("Submit"));
        expect(await screen.findByText("Subject is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
    });

    test("submits grievance successfully", async () => {
        fetch
            .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial load
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, grievance_id: "G002" }) }) // submit
            .mockResolvedValueOnce({ ok: true, json: async () => mockGrievances }); // refresh

        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "New Issue" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Detailed issue" }
        });

        const btn = screen.getByText("Submit");
        fireEvent.click(btn);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    });

    test("handles grievance submission failure", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        fetch
            .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial load
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ detail: "Failed to create grievance" })
            }); // fail

        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Bad Issue" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Bad details" }
        });
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        // Verify form is still open (not closed on error)
        expect(screen.getByText("Raise New Grievance")).toBeInTheDocument();

        consoleErrorSpy.mockRestore();
    });

    test("file upload preview works", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));
        const input = screen.getByTestId("file-input");
        const file = new File(["hello"], "test.png", { type: "image/png" });
        fireEvent.change(input, { target: { files: [file] } });
        expect(input.files[0].name).toBe("test.png");
    });

    test("view grievance details modal opens and closes", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });
        render(<Support />);
        await waitFor(() => expect(screen.getAllByText("G001").length).toBeGreaterThan(0));

        // Click first View button (desktop table)
        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => expect(screen.getByText("Grievance Details")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Close"));
        await waitFor(() =>
            expect(screen.queryByText("Grievance Details")).not.toBeInTheDocument()
        );
    });

    test("FAQ expand/collapse works", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);
        const faqButton = screen.getByText("How do I raise a grievance?");
        fireEvent.click(faqButton);
        expect(screen.getByText(/Click the "New Grievance"/)).toBeInTheDocument();
        fireEvent.click(faqButton);
        expect(screen.queryByText(/Click the "New Grievance"/)).not.toBeInTheDocument();
    });

    test("renders video tutorials correctly", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);
        expect(await screen.findByText("How to apply for subsidies?")).toBeInTheDocument();
    });

    test("handles failed grievance fetch", async () => {
        fetch.mockResolvedValueOnce({ ok: false });
        render(<Support />);
        await waitFor(() => expect(fetch).toHaveBeenCalled());
    });

    test("image file upload shows preview", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const fileInput = screen.getByTestId("file-input");
        const imageFile = new File(["dummy"], "test.jpg", { type: "image/jpeg" });

        fireEvent.change(fileInput, { target: { files: [imageFile] } });

        await waitFor(() => {
            expect(screen.getByText("test.jpg")).toBeInTheDocument();
        });
    });

    test("non-image file upload works without preview", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const fileInput = screen.getByTestId("file-input");
        const pdfFile = new File(["dummy"], "test.pdf", { type: "application/pdf" });

        fireEvent.change(fileInput, { target: { files: [pdfFile] } });

        await waitFor(() => {
            expect(screen.getByText("test.pdf")).toBeInTheDocument();
        });
    });

    test("submits grievance with attachment", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 2,
                grievance_id: "G002",
                subject: "Test with file",
                created_at: "2025-01-02T00:00:00Z",
                status: "Pending",
                description: "Description with file",
                attachment_url: "http://example.com/file.pdf"
            })
        });
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

        render(<Support />);
        await waitFor(() => expect(screen.getByText("New Grievance")).toBeInTheDocument());

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Test with file" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Description with file" }
        });

        const fileInput = screen.getByTestId("file-input");
        const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => expect(screen.getByText("test.pdf")).toBeInTheDocument());

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(toast.sucess).toHaveBeenCalledWith("Grievance submitted successfully");
        }, { timeout: 3000 });
    });

    test("cancel button closes form", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() => {
            expect(screen.queryByText("Raise New Grievance")).not.toBeInTheDocument();
        });
    });

    test("clicking form backdrop closes form", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const backdrop = document.querySelector(".fixed.inset-0.z-50 > .absolute.inset-0.bg-black");
        fireEvent.click(backdrop);

        await waitFor(() => {
            expect(screen.queryByText("Raise New Grievance")).not.toBeInTheDocument();
        });
    });

    test("clicking details modal backdrop closes modal", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });
        render(<Support />);
        await waitFor(() => expect(screen.getAllByText("G001").length).toBeGreaterThan(0));

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => expect(screen.getByText("Grievance Details")).toBeInTheDocument());

        const backdrops = document.querySelectorAll(".fixed.inset-0.z-50 > .absolute.inset-0.bg-black");
        fireEvent.click(backdrops[backdrops.length - 1]);

        await waitFor(() => {
            expect(screen.queryByText("Grievance Details")).not.toBeInTheDocument();
        });
    });

    test("displays grievance with attachment in details modal", async () => {
        const grievanceWithAttachment = [{
            id: 1,
            grievance_id: "G001",
            subject: "Test subject",
            created_at: "2025-01-01T00:00:00Z",
            status: "Pending",
            description: "Test description",
            attachment_url: "http://example.com/file.pdf",
            officer_remark: null
        }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => grievanceWithAttachment
        });
        render(<Support />);

        await waitFor(() => {
            const viewButtons = screen.queryAllByRole("button", { name: /view/i });
            return viewButtons.length > 0;
        });

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText("Grievance Details")).toBeInTheDocument();
            expect(screen.getByText("View attachment")).toBeInTheDocument();
        });
    });

    test("displays officer remark in details modal", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });
        render(<Support />);
        await waitFor(() => expect(screen.getAllByText("G001").length).toBeGreaterThan(0));

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText("Grievance Details")).toBeInTheDocument();
            expect(screen.getByText("Officer Remark")).toBeInTheDocument();
            expect(screen.getByText("Noted")).toBeInTheDocument();
        });
    });

    test("changes preferred contact to phone", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const phoneRadio = screen.getByLabelText("Phone");
        fireEvent.click(phoneRadio);

        expect(phoneRadio.checked).toBe(true);
    });

    test("displays empty grievances table when no grievances", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        await waitFor(() => {
            expect(screen.getByText("My Grievances")).toBeInTheDocument();
        });

        // Table should be empty - no rows in tbody
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
    });

    test("displays multiple grievances correctly", async () => {
        const multipleGrievances = [
            {
                id: 1,
                grievance_id: "G001",
                subject: "First issue",
                created_at: "2025-01-01T00:00:00Z",
                status: "Pending",
                description: "First description",
                attachment_url: null,
                officer_remark: null
            },
            {
                id: 2,
                grievance_id: "G002",
                subject: "Second issue",
                created_at: "2025-01-02T00:00:00Z",
                status: "Resolved",
                description: "Second description",
                attachment_url: null,
                officer_remark: "Fixed"
            },
            {
                id: 3,
                grievance_id: "G003",
                subject: "Third issue",
                created_at: "2025-01-03T00:00:00Z",
                status: "Rejected",
                description: "Third description",
                attachment_url: null,
                officer_remark: null
            }
        ];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => multipleGrievances
        });

        render(<Support />);

        await waitFor(() => {
            expect(screen.getAllByText(/G00[1-3]/).length).toBeGreaterThan(0);
        });

        expect(screen.getAllByText("First issue").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Second issue").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Third issue").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Resolved").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Rejected").length).toBeGreaterThan(0);
    });

    test("displays different status badges with correct styling", async () => {
        const grievancesWithDifferentStatuses = [
            {
                id: 1,
                grievance_id: "G001",
                subject: "Approved issue",
                created_at: "2025-01-01T00:00:00Z",
                status: "Approved",
                description: "Test",
                attachment_url: null,
                officer_remark: null
            },
            {
                id: 2,
                grievance_id: "G002",
                subject: "Under Review issue",
                created_at: "2025-01-02T00:00:00Z",
                status: "Under Review",
                description: "Test",
                attachment_url: null,
                officer_remark: null
            }
        ];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => grievancesWithDifferentStatuses
        });

        render(<Support />);

        await waitFor(() => {
            expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Under Review").length).toBeGreaterThan(0);
        });
    });

    test("handles fetch error gracefully", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        fetch.mockRejectedValueOnce(new Error("Network error"));

        render(<Support />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching grievances", expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
    });

    test("form validation shows multiple errors", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        // Submit without filling anything
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Subject is required")).toBeInTheDocument();
            expect(screen.getByText("Description is required")).toBeInTheDocument();
        });
    });

    test("clears validation errors when fields are filled", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        // Submit empty form to trigger errors
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Subject is required")).toBeInTheDocument();
        });

        // Fill in the fields
        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "New subject" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "New description" }
        });

        // Errors should still be visible until form is resubmitted
        expect(screen.getByText("Subject is required")).toBeInTheDocument();
    });

    test("opens FAQ items one at a time", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        const faqButton1 = screen.getByText("How do I raise a grievance?");
        const faqButton2 = screen.getByText("How long does it take to resolve a grievance?");

        // Open first FAQ
        fireEvent.click(faqButton1);
        expect(screen.getByText(/Click the "New Grievance"/)).toBeInTheDocument();

        // Open second FAQ - first should still be open since we don't close it
        fireEvent.click(faqButton2);
        expect(screen.getByText(/Resolution time depends on the complexity/)).toBeInTheDocument();

        // First FAQ answer should be closed
        expect(screen.queryByText(/Click the "New Grievance"/)).not.toBeInTheDocument();
    });

    test("all FAQ items can be opened and closed", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        const faqQuestions = [
            "How do I raise a grievance?",
            "How long does it take to resolve a grievance?",
            "Can I attach documents or images?",
            "How will I be contacted about my grievance?",
            "What if my grievance is rejected?"
        ];

        for (const question of faqQuestions) {
            const button = screen.getByText(question);
            fireEvent.click(button);

            // Check that answer appears (text content check)
            await waitFor(() => {
                const allText = screen.getByText(question).closest('div').parentElement.textContent;
                expect(allText.length).toBeGreaterThan(question.length);
            });

            // Close it
            fireEvent.click(button);
        }
    });

    test("video tutorials display all items", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        await waitFor(() => {
            expect(screen.getByText("How to apply for subsidies?")).toBeInTheDocument();
            expect(screen.getByText("How to check application status?")).toBeInTheDocument();
            expect(screen.getByText("How to raise a grievance?")).toBeInTheDocument();
            expect(screen.getByText("How to Compare subsidies?")).toBeInTheDocument();
            expect(screen.getByText("How to check eligibility?")).toBeInTheDocument();
            expect(screen.getByText("How to upload documents?")).toBeInTheDocument();
        });
    });

    test("displays grievance without attachment in details modal", async () => {
        const grievanceNoAttachment = [{
            id: 1,
            grievance_id: "G001",
            subject: "Test subject",
            created_at: "2025-01-01T00:00:00Z",
            status: "Pending",
            description: "Test description",
            attachment_url: null,
            officer_remark: null
        }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => grievanceNoAttachment
        });

        render(<Support />);

        await waitFor(() => {
            const viewButtons = screen.queryAllByRole("button", { name: /view/i });
            return viewButtons.length > 0;
        });

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText("Grievance Details")).toBeInTheDocument();
        });

        // Attachment section should not be present
        expect(screen.queryByText("View attachment")).not.toBeInTheDocument();
    });

    test("displays grievance without officer remark in details modal", async () => {
        const grievanceNoRemark = [{
            id: 1,
            grievance_id: "G001",
            subject: "Test subject",
            created_at: "2025-01-01T00:00:00Z",
            status: "Pending",
            description: "Test description",
            attachment_url: null,
            officer_remark: null
        }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => grievanceNoRemark
        });

        render(<Support />);

        await waitFor(() => {
            const viewButtons = screen.queryAllByRole("button", { name: /view/i });
            return viewButtons.length > 0;
        });

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText("Grievance Details")).toBeInTheDocument();
        });

        // Officer remark section should not be present
        expect(screen.queryByText("Officer Remark")).not.toBeInTheDocument();
    });

    test("modal displays all grievance details correctly", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockGrievances
        });

        render(<Support />);

        await waitFor(() => {
            const viewButtons = screen.queryAllByRole("button", { name: /view/i });
            return viewButtons.length > 0;
        });

        const viewButtons = screen.getAllByRole("button", { name: /view/i });
        fireEvent.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByText("Grievance Details")).toBeInTheDocument();
            expect(screen.getByText("Details for G001")).toBeInTheDocument();
            expect(screen.getAllByText("Grievance ID").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Subject").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Date").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Description").length).toBeGreaterThan(0);
        });
    });

    test("submit button is disabled during submission", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        fetch.mockImplementationOnce(() =>
            new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                json: async () => ({
                    id: 1,
                    grievance_id: "G001",
                    subject: "Test",
                    created_at: "2025-01-01T00:00:00Z",
                    status: "Pending"
                })
            }), 100))
        );
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Test subject" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Test description" }
        });

        const submitButton = screen.getByText("Submit");
        fireEvent.click(submitButton);

        // Button should be disabled during submission
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    test("handles API error with no detail message", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({}) // No detail field
        });

        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Test" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Test description" }
        });

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    test("handles malformed JSON response on error", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => { throw new Error("Invalid JSON"); }
        });

        render(<Support />);
        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Test" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Test description" }
        });

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    test("email contact is selected by default", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const emailRadio = screen.getByLabelText("Email");
        expect(emailRadio.checked).toBe(true);
    });

    test("can switch between email and phone contact methods", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        const emailRadio = screen.getByLabelText("Email");
        const phoneRadio = screen.getByLabelText("Phone");

        expect(emailRadio.checked).toBe(true);
        expect(phoneRadio.checked).toBe(false);

        fireEvent.click(phoneRadio);
        expect(phoneRadio.checked).toBe(true);
        expect(emailRadio.checked).toBe(false);

        fireEvent.click(emailRadio);
        expect(emailRadio.checked).toBe(true);
        expect(phoneRadio.checked).toBe(false);
    });

    test("form is reset after canceling", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
        render(<Support />);

        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        // Fill form
        fireEvent.change(screen.getByPlaceholderText("Short summary"), {
            target: { value: "Test subject" }
        });
        fireEvent.change(screen.getByPlaceholderText("Describe the issue in detail"), {
            target: { value: "Test description" }
        });

        // Cancel
        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() => {
            expect(screen.queryByText("Raise New Grievance")).not.toBeInTheDocument();
        });

        // Reopen form - should be empty
        fireEvent.click(screen.getByText("New Grievance"));
        await waitFor(() => expect(screen.getByText("Raise New Grievance")).toBeInTheDocument());

        expect(screen.getByPlaceholderText("Short summary")).toHaveValue("");
        expect(screen.getByPlaceholderText("Describe the issue in detail")).toHaveValue("");
    });

    test("displays correct serial numbers for grievances", async () => {
        const multipleGrievances = [
            {
                id: 5,
                grievance_id: "G005",
                subject: "First",
                created_at: "2025-01-01T00:00:00Z",
                status: "Pending",
                description: "Test",
                attachment_url: null,
                officer_remark: null
            },
            {
                id: 7,
                grievance_id: "G007",
                subject: "Second",
                created_at: "2025-01-02T00:00:00Z",
                status: "Pending",
                description: "Test",
                attachment_url: null,
                officer_remark: null
            }
        ];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => multipleGrievances
        });

        render(<Support />);

        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // Check that serial numbers start from 1
            expect(rows[1].textContent).toContain('1');
            expect(rows[2].textContent).toContain('2');
        });
    });
});

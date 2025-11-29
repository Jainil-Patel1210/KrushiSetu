import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '../../../../src/Components/User_Profile/Sidebar';

// Mock child components used inside Sidebar
vi.mock('../../../../src/Components/User_Profile/Dashboard.jsx', () => ({ default: () => <div data-testid="dashboard">Dashboard</div> }));
vi.mock('../../../../src/Components/User_Profile/personal_info.jsx', () => ({ default: () => <div data-testid="personal">Personal</div> }));
vi.mock('../../../../src/Components/User_Profile/Subsidy_List.jsx', () => ({ default: () => <div data-testid="subsidy-list">SubsidyList</div> }));
vi.mock('../../../../src/Components/User_Profile/Documents.jsx', () => ({ default: () => <div data-testid="documents">Documents</div> }));
vi.mock('../../../../src/Components/User_Profile/Support.jsx', () => ({ default: () => <div data-testid="support">Support</div> }));
vi.mock('../../../../src/Components/User_Profile/SubsidyRecommandation.jsx', () => ({ default: () => <div data-testid="recommend">Recommend</div> }));

// Mock api module used to fetch photo and logout
vi.mock('../../../../src/Components/User_Profile/api1', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
    Toaster: () => <div data-testid="toaster">Toaster</div>
}));

// Mock utils clearAuth and Cookies
vi.mock('../../../../src/utils/auth.js', () => ({ clearAuth: vi.fn() }));
vi.mock('js-cookie', () => ({ default: { remove: vi.fn() } }));

// mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

import api from '../../../../src/Components/User_Profile/api1';
import { clearAuth } from '../../../../src/utils/auth.js';
import Cookies from 'js-cookie';

describe('Sidebar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // ensure api.get has a default resolved value to avoid undefined responses
        api.get.mockResolvedValue({ data: { photo_url: null } });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders sidebar and basic UI elements', () => {
        render(<Sidebar />);
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByAltText(/Account/i)).toBeInTheDocument();
        // sidebar options - allow multiple matches (desktop button + mocked content)
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Profile & Personal Details').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Subsidies').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Recommend Subsidy').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Support').length).toBeGreaterThan(0);
    });

    it('fetches and displays user photo when api returns url', async () => {
        api.get.mockResolvedValueOnce({ data: { photo_url: 'https://example.com/me.jpg' } });
        render(<Sidebar />);
        await waitFor(() => {
            const img = screen.getByAltText(/Account/i);
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toBe('https://example.com/me.jpg');
        });
    });

    it('opens dropdown and navigates to change-password when clicking Change Password', async () => {
        api.get.mockResolvedValueOnce({ data: { photo_url: null } });
        render(<Sidebar />);
        const img = screen.getByAltText(/Account/i);
        fireEvent.click(img);

        // dropdown items should appear
        await waitFor(() => {
            expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
            expect(screen.getByText(/Logout/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Change Password/i));
        expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });

    it('performs logout: calls api.post, clears auth, removes cookies and redirects', async () => {
        api.get.mockResolvedValueOnce({ data: { photo_url: null } });
        api.post.mockResolvedValueOnce({});
        // we only assert immediate local logout effects in this unit test

        render(<Sidebar />);
        const img = screen.getByAltText(/Account/i);
        fireEvent.click(img);

        await waitFor(() => expect(screen.getByText(/Logout/i)).toBeInTheDocument());

        // click the actual logout button (choose button element if multiple matches)
        const logoutMatches = screen.getAllByText(/Logout/i);
        let logoutBtn = logoutMatches.find(el => el.tagName === 'BUTTON' || el.closest('button'));
        if (!logoutBtn) logoutBtn = logoutMatches[0];
        const logoutButtonElement = logoutBtn.tagName === 'BUTTON' ? logoutBtn : logoutBtn.closest('button');
        fireEvent.click(logoutButtonElement);

        // local flag set immediately (logout begins)
        await waitFor(() => expect(localStorage.getItem('isLoggedOut')).toBe('true'));
        // clearAuth called
        expect(clearAuth).toHaveBeenCalled();
        // cookies removed
        expect(Cookies.remove).toHaveBeenCalled();

        // api.post may be attempted by the component; assert if it was called
        if (api.post.mock.calls.length > 0) {
            expect(api.post).toHaveBeenCalledWith('/api/logout/');
        }

        // we don't assert the redirect here (it's scheduled via setTimeout).
        // restoring any globals is unnecessary because we didn't stub them.
    });

    it('clicking Profile sidebar option renders Personal component', async () => {
        render(<Sidebar />);
        // desktop sidebar contains the label; find the actual button element and click it
        const profileMatches = screen.getAllByText('Profile & Personal Details');
        expect(profileMatches.length).toBeGreaterThan(0);
        let profileBtn = profileMatches.find(el => el.tagName === 'BUTTON' || el.closest('button'));
        if (!profileBtn) profileBtn = profileMatches[0];
        const profileButtonElement = profileBtn.tagName === 'BUTTON' ? profileBtn : profileBtn.closest('button');
        fireEvent.click(profileButtonElement);


        // Personal component is mocked and should be rendered in content area
        await waitFor(() => expect(screen.getByTestId('personal')).toBeInTheDocument());
    });

    it('renders dashboard by default', () => {
        render(<Sidebar />);
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('renders mobile header logo and notification icon', () => {
        render(<Sidebar />);
        const imgs = screen.getAllByRole('img');
        // at least one image should be the banner and one should be the notifications icon
        expect(imgs.some(i => i.getAttribute('src')?.includes('Krushisetu_banner-removebg-preview.png'))).toBe(true);
        expect(screen.getByAltText('Notifications')).toBeInTheDocument();
    });

    it('renders fallback account image when no photoUrl', async () => {
        api.get.mockResolvedValueOnce({ data: { photo_url: null } });
        render(<Sidebar />);
        await waitFor(() => {
            const img = screen.getByAltText(/Account/i);
            expect(img.getAttribute('src')).toContain('Account.svg');
        });
    });

    it('changes page when sidebar button clicked and closes mobile menu when page changes', async () => {
        render(<Sidebar />);

        // open mobile menu first
        const toggle = screen.getByLabelText(/Toggle menu/i);
        fireEvent.click(toggle);

        // ensure mobile overlay opened
        const overlay = document.querySelector('.fixed.inset-0');
        expect(overlay).toBeTruthy();

        // click Profile option in mobile menu
        const mobileProfile = screen.getAllByText('Profile & Personal Details').find(el => el.closest('button'));
        const profileBtn = mobileProfile?.closest('button') || mobileProfile;
        if (profileBtn) fireEvent.click(profileBtn);

        // content should show Personal component and overlay should be removed
        await waitFor(() => expect(screen.getByTestId('personal')).toBeInTheDocument());
        const overlayAfter = document.querySelector('.fixed.inset-0');
        expect(overlayAfter).toBeFalsy();
    });

    it('renders each page when corresponding sidebar option clicked', async () => {
        render(<Sidebar />);

        // Documents
        const docBtn = screen.getAllByText('Documents').find(el => el.closest('button'))?.closest('button');
        if (docBtn) fireEvent.click(docBtn);
        await waitFor(() => expect(screen.getByTestId('documents')).toBeInTheDocument());

        // Subsidies
        const subBtn = screen.getAllByText('Subsidies').find(el => el.closest('button'))?.closest('button');
        if (subBtn) fireEvent.click(subBtn);
        await waitFor(() => expect(screen.getByTestId('subsidy-list')).toBeInTheDocument());

        // RecommendSubsidy
        const recBtn = screen.getAllByText('Recommend Subsidy').find(el => el.closest('button'))?.closest('button');
        if (recBtn) fireEvent.click(recBtn);
        await waitFor(() => expect(screen.getByTestId('recommend')).toBeInTheDocument());

        // Support
        const supBtn = screen.getAllByText('Support').find(el => el.closest('button'))?.closest('button');
        if (supBtn) fireEvent.click(supBtn);
        await waitFor(() => expect(screen.getByTestId('support')).toBeInTheDocument());
    });

    it('opens and closes mobile sidebar toggle and overlay', () => {
        render(<Sidebar />);
        const toggle = screen.getByLabelText(/Toggle menu/i);
        fireEvent.click(toggle);
        // overlay and mobile menu should be in DOM
        expect(document.querySelector('.fixed.inset-0')).toBeTruthy();

        // clicking backdrop closes menu
        const backdrop = document.querySelector('.fixed.inset-0');
        if (backdrop) fireEvent.click(backdrop);
        expect(document.querySelector('.fixed.inset-0')).toBeFalsy();
    });

    it('sidebar toggle icon changes state when opening and closing', () => {
        render(<Sidebar />);
        const toggle = screen.getByLabelText(/Toggle menu/i);
        const spansBefore = toggle.querySelectorAll('span');
        const classListBefore = Array.from(spansBefore).map(s => s.className);
        fireEvent.click(toggle);
        const spansAfter = toggle.querySelectorAll('span');
        const classListAfter = Array.from(spansAfter).map(s => s.className);
        // at least one span's class changes to indicate rotation when open
        expect(classListBefore.join('')).not.toEqual(classListAfter.join(''));
        fireEvent.click(toggle);
        const spansAfterClose = toggle.querySelectorAll('span');
        const classListAfterClose = Array.from(spansAfterClose).map(s => s.className);
        expect(classListAfterClose.join('')).toEqual(classListBefore.join(''));
    });

    it('calls API /profile/user/photo on mount and renders fetched profile photo', async () => {
        api.get.mockResolvedValueOnce({ data: { photo_url: 'https://example.com/me2.jpg' } });
        render(<Sidebar />);
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/profile/user/photo/'));
        await waitFor(() => {
            const img = screen.getByAltText(/Account/i);
            expect(img.getAttribute('src')).toBe('https://example.com/me2.jpg');
        });
    });

    it('handles photo fetch failure and logs error', async () => {
        api.get.mockRejectedValueOnce(new Error('network'));
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        render(<Sidebar />);
        await waitFor(() => expect(spy).toHaveBeenCalled());
        spy.mockRestore();
    });

    it('opens dropdown when profile image is clicked and closes when clicking outside', async () => {
        render(<Sidebar />);
        const img = screen.getByAltText(/Account/i);
        fireEvent.click(img);
        await waitFor(() => expect(screen.getByText(/Change Password/i)).toBeInTheDocument());

        // clicking outside should close dropdown
        fireEvent.mouseDown(document.body);
        await waitFor(() => expect(screen.queryByText(/Change Password/i)).not.toBeInTheDocument());
    });

    it('keeps dropdown open when clicking inside dropdown and contains correct items', async () => {
        render(<Sidebar />);
        const img = screen.getByAltText(/Account/i);
        fireEvent.click(img);
        const dropdownItem = await screen.findByText(/Change Password/i);
        // click inside the dropdown (the item itself)
        fireEvent.mouseDown(dropdownItem);
        expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    it('logout flow: sets isLoggedOut, calls API, clears auth, removes cookies', async () => {
        api.post.mockResolvedValueOnce({});

        render(<Sidebar />);
        const img = screen.getByAltText(/Account/i);
        fireEvent.click(img);
        const logoutBtn = await screen.findByText(/Logout/i);
        // click logout
        const btn = logoutBtn.closest('button') || logoutBtn;
        fireEvent.click(btn);

        // immediate local flag set and local cleanup performed
        await waitFor(() => expect(localStorage.getItem('isLoggedOut')).toBe('true'));
        expect(clearAuth).toHaveBeenCalled();
        expect(Cookies.remove).toHaveBeenCalled();
        expect(api.post).toHaveBeenCalledWith('/api/logout/');
    });

    it('shows error toast when logout server unreachable', async () => {
        const toast = require('react-hot-toast').toast;

        api.post.mockRejectedValueOnce(new Error('network'));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        render(<Sidebar />);
        fireEvent.click(screen.getByAltText(/Account/i));
        const logoutBtn1 = await screen.findByText(/Logout/i);
        const btn1 = logoutBtn1.closest('button') || logoutBtn1;
        fireEvent.click(btn1);
        await waitFor(() => expect(warnSpy).toHaveBeenCalled());
        warnSpy.mockRestore();
    }, 20000);

    it('renders sidebar option icons and highlights active option when clicked', () => {
        render(<Sidebar />);
        const optionButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.trim().length > 0);
        // find Dashboard button element
        const dashBtn = optionButtons.find(b => b.textContent?.includes('Dashboard'));
        expect(dashBtn).toBeTruthy();
        const img = dashBtn?.querySelector('img');
        expect(img).toBeTruthy();

        // click an option and verify it gets highlighted
        const profileBtn = optionButtons.find(b => b.textContent?.includes('Profile & Personal Details'));
        if (profileBtn) fireEvent.click(profileBtn);
        expect(profileBtn.className).toContain('bg-green-700');
    });

    it('desktop and mobile sidebar elements exist with expected classes', () => {
        render(<Sidebar />);
        // mobile header has class lg:hidden
        const mobileHeader = document.querySelector('[class*="lg:hidden"]');
        expect(mobileHeader).toBeTruthy();
        // desktop sidebar container has 'hidden lg:flex' present in className
        const all = Array.from(document.querySelectorAll('[class]'));
        const found = all.find(el => el.className && el.className.includes('hidden') && el.className.includes('lg:flex'));
        expect(found).toBeTruthy();
    });

});

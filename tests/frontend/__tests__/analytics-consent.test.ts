import { waitFor } from '@testing-library/dom';

declare global {
    interface Window {
        knokspackAnalyticsConsent?: { ajaxUrl: string; nonce: string };
    }
}

describe('analytics preference controls', () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = `<details class="knokspack-analytics-preferences">
            <button data-knokspack-consent="granted">Allow</button>
            <button data-knokspack-consent="denied">Keep off</button>
            <p data-knokspack-consent-status role="status"></p>
        </details>`;
        window.knokspackAnalyticsConsent = { ajaxUrl: '/wp-admin/admin-ajax.php', nonce: 'fixture' };
        window.fetch = jest.fn();
        require('../../../assets/js/analytics-consent.js');
    });

    afterEach(() => {
        delete window.knokspackAnalyticsConsent;
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    const button = (choice: string) => document.querySelector<HTMLButtonElement>(`[data-knokspack-consent="${choice}"]`)!;

    it('sends no request before the visitor chooses', () => {
        expect(window.fetch).not.toHaveBeenCalled();
    });

    it('sends withdrawal to the same-origin endpoint and confirms only after success', async () => {
        (window.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { consent: 'denied' } }) });
        button('denied').click();
        const [url, options] = (window.fetch as jest.Mock).mock.calls[0];
        expect(url).toBe('/wp-admin/admin-ajax.php');
        expect(options.credentials).toBe('same-origin');
        expect(options.body.get('consent')).toBe('denied');
        expect(options.body.get('nonce')).toBe('fixture');
        await waitFor(() => expect(document.querySelector('[role="status"]')?.textContent).toContain('No further analytics'));
        expect(button('granted').disabled).toBe(false);
        expect(button('denied').disabled).toBe(false);
    });

    it('prevents concurrent opposite choices while a save is pending', async () => {
        let finish!: (response: unknown) => void;
        (window.fetch as jest.Mock).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
        button('granted').click();
        expect(button('denied').disabled).toBe(true);
        button('denied').click();
        expect(window.fetch).toHaveBeenCalledTimes(1);
        finish({ ok: true, json: async () => ({ success: true, data: { consent: 'granted' } }) });
        await waitFor(() => expect(button('denied').disabled).toBe(false));
    });

    it('reports failure without claiming consent was saved and allows retry', async () => {
        (window.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ success: false, data: 'Expired preference request' }) });
        button('denied').click();
        await waitFor(() => expect(document.querySelector('[role="status"]')?.textContent).toBe('Expired preference request'));
        expect(button('denied').disabled).toBe(false);
    });
});

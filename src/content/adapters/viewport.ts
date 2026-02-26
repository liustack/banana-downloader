export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForDomQuiet(maxWaitMs: number, quietMs = 120): Promise<void> {
    await new Promise<void>((resolve) => {
        let settled = false;
        let quietTimer: number | null = null;

        const finish = (): void => {
            if (settled) {
                return;
            }
            settled = true;
            if (quietTimer !== null) {
                window.clearTimeout(quietTimer);
            }
            observer.disconnect();
            resolve();
        };

        const armQuietTimer = (): void => {
            if (quietTimer !== null) {
                window.clearTimeout(quietTimer);
            }
            quietTimer = window.setTimeout(finish, quietMs);
        };

        const observer = new MutationObserver(() => {
            armQuietTimer();
        });

        observer.observe(document.body ?? document.documentElement, {
            childList: true,
            subtree: true,
        });

        armQuietTimer();
        window.setTimeout(finish, maxWaitMs);
    });
}

function isScrollableContainer(node: HTMLElement): boolean {
    if (node.clientHeight <= 0) {
        return false;
    }

    if (node.scrollHeight - node.clientHeight < 240) {
        return false;
    }

    const style = window.getComputedStyle(node);
    return /auto|scroll|overlay/i.test(style.overflowY);
}

function collectScrollableContainers(): HTMLElement[] {
    const containers: HTMLElement[] = [];
    const seen = new Set<HTMLElement>();

    const rootScroller = document.scrollingElement;
    if (rootScroller instanceof HTMLElement) {
        containers.push(rootScroller);
        seen.add(rootScroller);
    }

    const candidates = Array.from(document.querySelectorAll<HTMLElement>('main, section, div, article'));

    for (const candidate of candidates) {
        if (seen.has(candidate)) {
            continue;
        }

        if (!isScrollableContainer(candidate)) {
            continue;
        }

        containers.push(candidate);
        seen.add(candidate);
    }

    containers.sort(
        (a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight),
    );

    return containers;
}

export function getScrollableContainers(maxContainers = 3): HTMLElement[] {
    return collectScrollableContainers().slice(0, maxContainers);
}

export async function preloadLazyContent(options?: {
    maxContainers?: number;
    maxStepsPerContainer?: number;
    waitMs?: number;
    restoreOriginalPosition?: boolean;
}): Promise<void> {
    const maxContainers = options?.maxContainers ?? 3;
    const maxStepsPerContainer = options?.maxStepsPerContainer ?? 120;
    const waitMs = options?.waitMs ?? 180;
    const restoreOriginalPosition = options?.restoreOriginalPosition ?? true;

    const containers = collectScrollableContainers().slice(0, maxContainers);
    if (containers.length === 0) {
        return;
    }

    for (const container of containers) {
        const originalTop = container.scrollTop;
        const stepPx = Math.max(container.clientHeight * 0.6, 280);
        let previousTop = -1;
        let stableSteps = 0;
        let previousImageCount = document.querySelectorAll('img').length;

        for (let step = 0; step < maxStepsPerContainer; step++) {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
                break;
            }

            const nextTop = Math.min(container.scrollTop + stepPx, container.scrollHeight);
            if (nextTop <= previousTop) {
                break;
            }

            previousTop = nextTop;
            container.scrollTo({ top: nextTop, behavior: 'auto' });
            await waitForDomQuiet(waitMs, 120);

            const currentImageCount = document.querySelectorAll('img').length;
            if (currentImageCount === previousImageCount) {
                stableSteps++;
            } else {
                stableSteps = 0;
                previousImageCount = currentImageCount;
            }

            if (stableSteps >= 8) {
                break;
            }
        }

        if (restoreOriginalPosition) {
            container.scrollTo({ top: originalTop, behavior: 'auto' });
            await sleep(140);
        }
    }
}

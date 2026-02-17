
import asyncio
from playwright.async_api import async_playwright
import time

async def verify_drakor():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Capture logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        # Navigate to the app
        print("Navigating to http://localhost:8787")
        try:
            await page.goto("http://localhost:8787", timeout=10000)
        except Exception as e:
            print(f"Failed to navigate: {e}")
            await browser.close()
            return

        # Wait for page load
        await page.wait_for_selector("#menuBtn", timeout=10000)
        print("Page loaded successfully.")

        # Open Sidebar
        print("Opening sidebar...")
        await page.click("#menuBtn")
        time.sleep(1)

        # Switch to Drakor Page
        print("Switching to Drakor Mods...")
        # Find the button that calls switchPage('drakor')
        await page.click("button[onclick=\"switchPage('drakor')\"]")
        time.sleep(2) # Allow transition

        # Check if initDrakor is called
        # We can evaluate js to check the content immediately
        content_html = await page.inner_html("#drakorContent")
        print(f"Initial Drakor Content: {content_html}")

        # Wait for content to load
        print("Waiting for Drakor content...")
        try:
            # Wait for at least one category header
            await page.wait_for_selector("#drakorContent h3", timeout=20000)
            print("Categories loaded.")

            # Wait for images to render
            await page.wait_for_selector("#drakorContent img", timeout=20000)
            print("Images rendered.")

             # Check content again
            content_html = await page.inner_html("#drakorContent")
            # print(f"Loaded Drakor Content: {content_html[:500]}...") # Truncate

            # Check for HEIC conversion (blob URL)
            print("Checking image conversion...")
            time.sleep(5)

            img_handle = await page.query_selector("#drakorContent img")
            if img_handle:
                src = await img_handle.get_attribute("src")
                print(f"First image src: {src}")
                if src and src.startswith("blob:"):
                    print("SUCCESS: Image converted to Blob URL!")
                elif src and "placeholder" in src:
                    print("WARNING: Image fallback triggered.")
                else:
                    print("WARNING: Image src is not a blob URL.")

        except Exception as e:
            print(f"Error waiting for content: {e}")
            await page.screenshot(path="verification/verify_drakor_error.png")

            # Print page source for debugging
            content = await page.content()
            # print(content)

            await browser.close()
            return

        # Click on the first card
        print("Opening Detail Modal...")
        cards = await page.query_selector_all(".group\\/card")
        if len(cards) > 0:
            await cards[0].click()
            time.sleep(2)

            # Verify Modal
            modal = await page.query_selector("#detailModal")
            if await modal.is_visible():
                print("Detail Modal is visible.")

                # Check Episodes
                episodes = await page.query_selector_all("#episodeGrid button")
                print(f"Found {len(episodes)} episodes.")

                if len(episodes) > 0:
                    # Click Episode 1
                    print("Clicking Episode 1...")
                    await episodes[0].click()
                    time.sleep(2)

                    # Verify Player
                    player_container = await page.query_selector("#playerContainer")
                    video = await page.query_selector("#videoPlayer")

                    if await player_container.is_visible():
                        print("Player Container is visible.")
                        video_src = await video.get_attribute("src")
                        print(f"Video Source: {video_src}")

                        if "BigBuckBunny" in video_src:
                             print("SUCCESS: Video player loaded sample video.")
                        else:
                             print("WARNING: Video source unexpected.")
                    else:
                        print("ERROR: Player container not visible.")
                else:
                    print("WARNING: No episodes found.")
            else:
                print("ERROR: Detail Modal did not open.")
        else:
            print("ERROR: No cards found to click.")

        # Take final screenshot
        await page.screenshot(path="verification/verify_drakor_detail.png")
        print("Screenshot saved to verification/verify_drakor_detail.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_drakor())

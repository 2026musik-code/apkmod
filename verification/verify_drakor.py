
from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    cwd = os.getcwd()
    html_path = f"file://{cwd}/src/temp_index.html"

    # Mock API
    def handle_drakor(route):
        url = route.request.url
        print(f"Drakor API: {url}")

        # Determine category from query
        # url looks like ...?query=CEO...
        data = []
        for i in range(5):
            data.append({
                "title": f"Drakor Title {i}",
                "book_id": str(i),
                "cover": "",
                "status": "Selesai",
                "total_chapters": "100"
            })

        route.fulfill(
            status=200,
            content_type="application/json",
            body=f'''
            {{
              "success": true,
              "status": 200,
              "result": {str(data).replace("'", '"')}
            }}
            '''
        )

    page.route("**/internet/melolo/search**", handle_drakor)

    print(f"Loading {html_path}")
    page.goto(html_path)

    # 1. Click Hamburger
    print("Clicking hamburger...")
    page.click("#hamburgerBtn")

    # 2. Sidebar should be visible (check translation class removed or position)
    # The sidebar toggles '-translate-x-full'. If removed, it's visible.
    # Or we can check if it's in viewport.
    sidebar = page.locator("#sidebar")
    # Wait for animation?
    page.wait_for_timeout(500)

    # 3. Click Drakor Mods
    print("Clicking DRAKOR MODS menu...")
    page.click("button:has-text('DRAKOR MODS')")

    # 4. Verify Drakor Page Visible
    print("Verifying Drakor Page...")
    drakor_page = page.locator("#drakorPage")
    expect(drakor_page).to_be_visible()

    # Main content should be hidden
    expect(page.locator("#mainContent")).to_be_hidden()

    # 5. Verify Categories Loaded
    print("Waiting for categories...")
    page.wait_for_selector("h3:text('CEO')")
    expect(page.locator("h3:text('CEO')")).to_be_visible()
    expect(page.locator("h3:text('ROMANTIS')")).to_be_visible()

    # 6. Verify Layout (Grid)
    # Check if we have items
    page.wait_for_selector("h4:text('Drakor Title 0')")

    # Take screenshot
    screenshot_path = os.path.join(cwd, "verification/verify_drakor.png")
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

import asyncio
from playwright.async_api import async_playwright
import os
import random

async def record_demo():
    print("Starting browser...")
    async with async_playwright() as p:
        # Launch browser with recording enabled
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="demo_videos/",
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        
        page = await context.new_page()
        
        # Helper for human-like typing
        async def type_like_human(selector, text):
            await page.click(selector)
            for char in text:
                await page.type(selector, char)
                await asyncio.sleep(random.uniform(0.02, 0.08))
                
        print("Navigating to app...")
        await page.goto("http://localhost:8000")
        await asyncio.sleep(2)
        
        # Registration (will redirect to login if not auth'd)
        if "login" in page.url:
            print("Registering new user...")
            await page.click("text=Register here")
            await asyncio.sleep(1)
            
            username = f"demouser_{random.randint(1000,9999)}"
            await type_like_human('input[placeholder="Choose a username"]', username)
            await type_like_human('input[placeholder="Enter your email"]', f"{username}@test.com")
            await type_like_human('input[placeholder="••••••••"]', "password123")
            
            await page.click("button:has-text('Sign Up')")
            await asyncio.sleep(2)
            
            await asyncio.sleep(2)
        
        # Now on Dashboard
        print("On Dashboard...")
        await asyncio.sleep(3)
        
        # Navigate to Keys
        print("Creating Key Pair...")
        await page.click("text=Key Management")
        await asyncio.sleep(2)
        await page.click("button:has-text('Generate New Key')")
        await asyncio.sleep(1)
        await type_like_human('input[placeholder="e.g. Production Key 2024"]', "Demo RSA Key")
        await page.click("button:has-text('Generate RSA-2048 Key')")
        await asyncio.sleep(3)
        
        # Download Demo PDF if not exists
        import urllib.request
        pdf_path = "backend/demo/Student_Certificate.pdf"
        if not os.path.exists(pdf_path):
            os.system("cd backend && python generate_demo_pdf.py")
            
        # Navigate to Sign Document
        print("Signing Document...")
        await page.click("text=Sign Document")
        await asyncio.sleep(2)
        
        # Set file in input
        file_input = await page.query_selector("input[type='file']")
        await file_input.set_input_files(os.path.abspath(pdf_path))
        await asyncio.sleep(2)
        
        await type_like_human('input[placeholder="e.g. Q3 Financial Report"]', "Demo Certificate")
        await page.click("button:has-text('Sign & Hash Document')")
        
        # Wait for success
        print("Waiting for signature...")
        await page.wait_for_selector("text=Signature Generated Successfully", timeout=10000)
        await asyncio.sleep(3)
        
        # Download the ZIP
        async with page.expect_download() as download_info:
            await page.click("button:has-text('Download Verification Package')")
        download = await download_info.value
        zip_path = await download.path()
        print(f"Downloaded ZIP to {zip_path}")
        await asyncio.sleep(2)
        
        # Navigate to Verify Document
        print("Verifying Document...")
        await page.click("text=Verify Document")
        await asyncio.sleep(2)
        
        # Upload ZIP
        verify_input = await page.query_selector("input[type='file']")
        await verify_input.set_input_files(zip_path)
        await asyncio.sleep(2)
        
        await page.click("button:has-text('Verify Integrity')")
        
        # Wait for verification result
        print("Waiting for verification result...")
        await page.wait_for_selector("text=VALID / INTEGRITY INTACT", timeout=10000)
        await asyncio.sleep(4)
        
        # View full report
        print("Viewing Full Report...")
        await page.click("button:has-text('View Full Report')")
        await asyncio.sleep(5)
        
        # Scroll down slightly to show report
        await page.evaluate("window.scrollBy(0, 500)")
        await asyncio.sleep(3)
        
        # Close context and browser to save video
        await context.close()
        await browser.close()
        
        print("Video recording completed in demo_videos/ directory!")

asyncio.run(record_demo())

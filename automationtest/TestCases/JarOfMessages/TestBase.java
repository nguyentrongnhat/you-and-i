package JarOfMessages;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import Constant.Constant;

public class TestBase {
	@Parameters("browser")
	@BeforeMethod
    public void beforeMethod(@Optional("chrome") String Browser) {
        System.out.println("Pre-condition");   
        String runBrowser = System.getProperty("browser", Browser);
        
        // Kiểm tra biến môi trường CI để xác định có đang chạy trên GitHub Actions không
        // GitHub Actions tự động set biến CI=true
        boolean isCI = Boolean.parseBoolean(System.getenv("CI"));
        
        if("chrome".equalsIgnoreCase(runBrowser)) {
            ChromeOptions options = new ChromeOptions();
            if (isCI) {
                options.addArguments("--headless=new");          // Ẩn giao diện trình duyệt
                options.addArguments("--no-sandbox");             // Bắt buộc trên Linux/Docker
                options.addArguments("--disable-dev-shm-usage");  // Tránh lỗi tràn bộ nhớ trên CI
                options.addArguments("--window-size=1920,1080");  // Đặt kích thước cửa sổ ảo
            }
            Constant.WEBDRIVER = new ChromeDriver(options);
        }
        else if("firefox".equalsIgnoreCase(runBrowser)) {
            FirefoxOptions options = new FirefoxOptions();
            if (isCI) {
                options.addArguments("--headless");
                options.addArguments("--width=1920");
                options.addArguments("--height=1080");
            }
            Constant.WEBDRIVER = new FirefoxDriver(options);
        }
        else {
            throw new RuntimeException("Unsupported browser: " + runBrowser);
        }
        
        Constant.WEBDRIVER.manage().window().maximize();      
    }
	
	@AfterMethod
    public void afterMethod() {
        System.out.println("Post-condition");
        if (Constant.WEBDRIVER != null) {
            Constant.WEBDRIVER.quit();
        }
    }
}
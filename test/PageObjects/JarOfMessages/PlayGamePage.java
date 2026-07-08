package JarOfMessages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import Common.Utilities;
import Constant.Constant;

public class PlayGamePage {
	// Locators 
    private final By _GamingArea = By.xpath("//div[@class='find-number__game-area']//div[@class='grid-container']");
    
    // Elements
    public WebElement getGamingArea() {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_GamingArea));
    }

}

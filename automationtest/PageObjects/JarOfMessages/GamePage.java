package JarOfMessages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import Common.Utilities;
import Constant.Constant;

public class GamePage extends GeneralPage{
	// Locators 
    private final By _btnPlayGame = By.xpath("//div[@class='start-button']//button");
    private final By _btnHistory = By.xpath("//button//span[text()='Lịch sử']");
    private final By _btnStartNewGame = By.xpath("//button//span[text()='Ván mới']");
    
    // Elements
    public WebElement getBtnPlayGame() {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_btnPlayGame));
    }
    
    public WebElement getBtnHistory () {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_btnHistory));
    }

    public WebElement getBtnStartNewGame () {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_btnStartNewGame));
    }
    
    //Method
    public PlayGamePage startNewGame() {
    		Utilities.scrollAndClick(getBtnPlayGame());
    		getBtnStartNewGame().click();
		return new PlayGamePage();
	}
}

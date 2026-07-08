package JarOfMessages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import Common.Utilities;
import Constant.Constant;


public class HomePage extends GeneralPage {
	//Locator
	private final By _lblWelcomeMessage = By.xpath("//div[@class='welcome-block']//h1");
	
	//Element
	protected WebElement getLblWelcomeMessage() {
	    return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_lblWelcomeMessage));
	}
	
	//Method
	public String getWelcomeMessage() {
	    return this.getLblWelcomeMessage().getText();
	}
	
	

}

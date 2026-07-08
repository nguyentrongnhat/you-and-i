package JarOfMessages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import Common.Utilities;
import Constant.Constant;

public class GeneralPage {
	//locators
	private final By _tabDashboard = By.xpath("//ul[@class='navigation-item']//i[@class='pi pi-home']");
	private final By _tabMemoria = By.xpath("//ul[@class='navigation-item']//i[@class='pi pi-heart-fill']");
	private final By _tabActivities = By.xpath("//ul[@class='navigation-item']//i[@class='pi pi-list-check']");
	private final By _tabMessages = By.xpath("//ul[@class='navigation-item']//i[@class='pi pi-send']");
	private final By _tabGame = By.xpath("//ul[@class='navigation-item']//i[@class='pi pi-discord']");
		
	// Elements
	protected WebElement getTabDashboard() {
	    return Constant.WEBDRIVER.findElement(_tabDashboard);
	}

	protected WebElement getTabMemoria() {
	    return Constant.WEBDRIVER.findElement(_tabMemoria);
	}
	
	protected WebElement getTabActivities () {
	    return Constant.WEBDRIVER.findElement(_tabActivities);
	}
	
	protected WebElement getTabMessages() {
	    return Constant.WEBDRIVER.findElement(_tabMessages);
	}
	
	protected WebElement getTabGame() {
	    return Constant.WEBDRIVER.findElement(_tabGame);
	}
		
	// Methods
	public HomePage gotoHomePage() {
		Utilities.waitForVisible(_tabDashboard);
		Utilities.scrollToElement(_tabDashboard);
		this.getTabDashboard().click();
		return new HomePage();		
	}
	
	public GamePage gotoGamePage() {
		Utilities.waitForVisible(_tabGame);
		Utilities.scrollToElement(_tabGame);
		this.getTabGame().click();
		return new GamePage();		
	}

}

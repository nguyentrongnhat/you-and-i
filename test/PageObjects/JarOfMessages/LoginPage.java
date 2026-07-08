package JarOfMessages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import Class.Account;
import Common.Utilities;
import Constant.Constant;

public class LoginPage extends GeneralPage {
	// Locators 
    private final By _txtUsername = By.xpath("//input[@type='email']");
    private final By _txtPassword = By.xpath("//input[@type='password']");
    private final By _CheckboxAcceptConditions = By.xpath("//input[@id='accept']");
    private final By _btnSignIn = By.xpath("//p-button[@label='Sign in']");
    private final By _btnSignUp = By.xpath("//p-button[@label='Sign up']");
    
    
    // Elements
    public WebElement getTxtUsername() {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_txtUsername));
    }

    public WebElement getTxtPassword() {
        return Constant.WEBDRIVER.findElement(Utilities.waitForVisible(_txtPassword));
    }
    
    public WebElement getCheckboxAcceptConditions() {
        return Constant.WEBDRIVER.findElement(_CheckboxAcceptConditions);
    }

    public WebElement getBtnSignIn() {
        return Constant.WEBDRIVER.findElement(_btnSignIn);
    }

    public WebElement getBtnSignUp(){
        return Constant.WEBDRIVER.findElement(_btnSignUp);
    }

    //Method
	public LoginPage openLoginPage() {
		Constant.WEBDRIVER.navigate().to(Constant.JAR_OF_MESSAGES_URL);
		return this;
	}
	
	public HomePage Login(String email, String password) {
		Utilities.scrollAndSenkeys(getTxtUsername(), email);
		Utilities.scrollAndSenkeys(getTxtPassword(), password);
		checkCheckboxAcceptConditions();
		Utilities.waitAndClick(_btnSignIn);
		return new HomePage();
	}
	
	public HomePage Login(Account account) {
		Utilities.scrollAndSenkeys(getTxtUsername(), account.getEmail());
		Utilities.scrollAndSenkeys(getTxtPassword(), account.getPassword());
		checkCheckboxAcceptConditions();
		Utilities.waitAndClick(_btnSignIn);
		return new HomePage();
	}
	
	public void checkCheckboxAcceptConditions() {
	    if (!getCheckboxAcceptConditions().isSelected()) {
	        getCheckboxAcceptConditions().click();
	    }
	}
}

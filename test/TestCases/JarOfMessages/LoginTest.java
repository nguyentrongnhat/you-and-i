package JarOfMessages;

import org.testng.Assert;
import org.testng.annotations.Test;

import Class.Account;
import Constant.Constant;

public class LoginTest extends TestBase{
	@Test
    public void TC01() {
        System.out.println("TC01 - User can log into Jar_Of_Messages with valid username and password");
        
        //Data
        Account userAccount = new Account(Constant.EMAIL, Constant.PASSWORD);     
        
        //Step
        System.out.println("1. Navigate to Jar_Of_Messages Website");
        LoginPage loginPage = new LoginPage();
        loginPage.openLoginPage();
        
        System.out.println("3. Enter valid Email and Password");   
        System.out.println("4. Click on \"Login\" button");
        HomePage homePage = loginPage.Login(userAccount);        

        //Verify
        System.out.println("Verify: User is logged into Jar_Of_Messages. Welcome user message is displayed.");
        String actualMsg = homePage.getWelcomeMessage();
        String expectedMsg = Constant.NICKNAME;

        Assert.assertTrue(actualMsg.contains(expectedMsg),"Welcome message does not contain expected nickname");
    }
}

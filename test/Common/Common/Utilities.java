package Common;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import Constant.Constant;


public class Utilities {

    public static String generateTimestampEmail() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyyHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        return timestamp;
    }
    
    //OPEN AND RELOAD PAGE
    public static void open(String URL) {
    		Constant.WEBDRIVER.navigate().to(URL);
    }
    
    public static void reload() {
		Constant.WEBDRIVER.navigate().refresh();
    }
        
    //OPEN TAG and SWITCH TAG 
    public static String openNewTab() {
        Constant.WEBDRIVER.switchTo().newWindow(org.openqa.selenium.WindowType.TAB);
        return Constant.WEBDRIVER.getWindowHandle();
    }

    public static void switchToWindow(String windowHandle) {
        Constant.WEBDRIVER.switchTo().window(windowHandle);
    }
    
    public static void openToAndSwitchTag(String url) {
	    	Constant.WEBDRIVER.switchTo().newWindow(WindowType.TAB);
	    	Constant.WEBDRIVER.get(url);
    }
    
    public static void switchToLastTag() {
	    	Set<String> windows = Constant.WEBDRIVER.getWindowHandles();
	    	String lastWindown = windows.toArray(new String[0])[windows.size() - 1];
	    	Constant.WEBDRIVER.switchTo().window(lastWindown);
    }
    
    public static void switchToFirstTab() {
        Set<String> windows = Constant.WEBDRIVER.getWindowHandles();
        String firstWindow = windows.toArray(new String[0])[0];
        Constant.WEBDRIVER.switchTo().window(firstWindow);
    }
    
    public static void switchToNewWindow() {
        String parentWindow = Constant.WEBDRIVER.getWindowHandle();

        WebDriverWait wait = new WebDriverWait(Constant.WEBDRIVER, Duration.ofSeconds(Constant.TIMEOUT));
        wait.until(ExpectedConditions.numberOfWindowsToBe(2));

        for (String window : Constant.WEBDRIVER.getWindowHandles()) {
            if (!window.equals(parentWindow)) {
                Constant.WEBDRIVER.switchTo().window(window);
                break;
            }
        }
    }
    //WAIT
    public static By waitForVisible(By locator, int timeout){
    		WebDriverWait wait = new WebDriverWait(Constant.WEBDRIVER, Duration.ofSeconds(timeout));
    		wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    		return locator;
    }
    
    public static By waitForVisible(By locator){
		return waitForVisible(locator, Constant.TIMEOUT);
    }
    
    public static By waitForPresence(By locator) {
	    	WebDriverWait wait = new WebDriverWait(Constant.WEBDRIVER, Duration.ofSeconds(Constant.TIMEOUT));
	    	wait.until(ExpectedConditions.presenceOfElementLocated(locator));
	    	return locator;
    }
    
    public static void waitForTableHasData(By rowLocator) {
        WebDriverWait wait = new WebDriverWait(Constant.WEBDRIVER, Duration.ofSeconds(Constant.TIMEOUT));
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(rowLocator, 0));
    }
    //WAIT TO CLICK
    public static void waitAndClick(By locator) {
    		WebDriverWait wait = new WebDriverWait(
    	        Constant.WEBDRIVER,
    	        Duration.ofSeconds(Constant.TIMEOUT)
    	    );

    	    WebElement element = wait.until(
    	        ExpectedConditions.elementToBeClickable(locator)
    	    );

    	    element.click();
    }
    
    //WAIT TO SENDKEY 
    public static void waitAndSenkey(By locator, String input){		
    		WebElement element = Constant.WEBDRIVER.findElement(waitForVisible(locator, Constant.TIMEOUT));
    		element.clear();
    		element.sendKeys(input);
    }
    
    
    //ALERT 
    public static void waitAlertAndAccept() {
    		WebDriverWait wait = new WebDriverWait(
    	        Constant.WEBDRIVER,
    	        Duration.ofSeconds(Constant.TIMEOUT)
    	    );

	    	wait.until(ExpectedConditions.alertIsPresent());
	
	    	Constant.WEBDRIVER.switchTo().alert().accept();
    }
    
    public static void waitAlertAndDismiss() {
    		WebDriverWait wait = new WebDriverWait(
    	        Constant.WEBDRIVER,
    	        Duration.ofSeconds(Constant.TIMEOUT)
    	    );

	    	wait.until(ExpectedConditions.alertIsPresent());
	
	    	Constant.WEBDRIVER.switchTo().alert().dismiss();
    }
    
    //SCROLL
    public static void scrollToElement(By locator){
		WebDriverWait wait = new WebDriverWait( Constant.WEBDRIVER, Duration.ofSeconds(30) ); 
		WebElement element = wait.until( ExpectedConditions.presenceOfElementLocated(locator) ); 
		
		JavascriptExecutor js = (JavascriptExecutor) Constant.WEBDRIVER; 
		js.executeScript( "arguments[0].scrollIntoView({block:'center'});", element );
		
    }
    
    public static void scrollToElement(WebElement element){
		JavascriptExecutor js = (JavascriptExecutor) Constant.WEBDRIVER;
		js.executeScript("arguments[0].scrollIntoView({block:'center'});", element);
    }
    
    public static void scrollToBottomPage() {
        JavascriptExecutor js = (JavascriptExecutor) Constant.WEBDRIVER;
        js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
    }

    //SCROLL AND CLICK
    public static void scrollAndClick(By locotor){
		scrollToElement(locotor);
		Constant.WEBDRIVER.findElement(locotor).click();
    }
    
    public static void scrollAndClick(WebElement element){
		scrollToElement(element);
		element.click();
    }
    
    //SCROLL AND SENKEYS
   
    public static void scrollAndSenkeys(By locotor, String text){
		scrollToElement(locotor);
		Constant.WEBDRIVER.findElement(locotor).sendKeys(text);
    }
    
    public static void scrollAndSenkeys(WebElement element, String text){
		scrollToElement(element);
		element.sendKeys(text);
    }
    
    //SELECT
    public static void selectByVisibleText(WebElement element, String text){
        if (text == null || text.isBlank()) {
        	System.out.println("Bỏ Qua Null: ");
            return;
        }
		scrollToElement(element);
		Select select = new Select(element);
		select.selectByVisibleText(text);
    }
    
    public static void selectByVisibleText(By locator, String text){
		scrollToElement(locator);
		Select select = new Select(findElement(locator));
		select.selectByVisibleText(text);
    }
    
    public static void selectByIndex(By locator, int index){
		scrollToElement(locator);
		Select select = new Select(findElement(locator));
		select.selectByIndex(index);
    }
 
    public static String getSelectFirstOption(WebElement element) {
	    	Select select = new Select(element);
	    	return select.getFirstSelectedOption().getText();
	}
    
    public static void waitForSelectOptionsChange(By selectLocator) {
        WebDriverWait wait = new WebDriverWait(Constant.WEBDRIVER, Duration.ofSeconds(Constant.TIMEOUT));

        Select select = new Select(Constant.WEBDRIVER.findElement(selectLocator));
        List<String> oldOptions = select.getOptions()
                .stream()
                .map(WebElement::getText)
                .toList();

        wait.until(driver -> {
            Select newSelect = new Select(driver.findElement(selectLocator));
            List<String> newOptions = newSelect.getOptions()
                    .stream()
                    .map(WebElement::getText)
                    .toList();
            return !newOptions.equals(oldOptions);
        });
    }
    
    //HANDLE TABLE  
    public static List<Map<String, String>> convertRowsToMap(List<WebElement> rows, List<WebElement> headers) {
        List<Map<String, String>> tableData = new ArrayList<>();

        for (WebElement row : rows) {
            List<WebElement> cells = row.findElements(By.tagName("td"));

            if (cells.isEmpty()) {
                continue;
            }

            Map<String, String> rowData = new LinkedHashMap<>();

            int columnCount = Math.min(headers.size(), cells.size());
            for (int i = 0; i < columnCount; i++) {
                String header = headers.get(i).getText().trim();
                String value  = cells.get(i).getText().trim();
                rowData.put(header, value);
            }
            tableData.add(rowData);
        }
        return tableData;
    }
    
    public static void printTable(List<Map<String, String>> table) {
        	System.out.println("PRINT TABLE: ");
	    if (table== null || table.isEmpty()) {
			System.out.println("Table is empty");
			return;
	    }
        int rowIndex = 0;
        for (Map<String, String> row : table) {
            System.out.println("Row " + rowIndex++);
            row.forEach((k, v) ->
                System.out.println("  " + k + " = [" + v + "]")
            );
        }
    }
    
    public static boolean isRowExistInTable(List<Map<String, String>> table, Map<String, String> expectedRow) {
        for (Map<String, String> row : table) {
            boolean match = true;

            for (Map.Entry<String, String> entry : expectedRow.entrySet()) {
                String key = entry.getKey();
                String expectedValue = entry.getValue();
                String actualValue = row.get(key);

                if (actualValue == null ||
                    !actualValue.trim().equalsIgnoreCase(expectedValue.trim())) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return true;
            }
        }
        return false;
    }
 
    public static boolean isRowExistExactlyInTable(List<Map<String, String>> table, Map<String, String> expectedRow) {
        return table.stream().anyMatch(row -> row.equals(expectedRow));
    }

    //FIND ELEMENT
    public static WebElement findElement(By locator) {
        return Constant.WEBDRIVER.findElement(locator);
    }
    
    //////////
    public static void jsClick(By locator) {
        WebElement element = Constant.WEBDRIVER.findElement(locator);
        JavascriptExecutor js = (JavascriptExecutor) Constant.WEBDRIVER;
        js.executeScript("arguments[0].click();", element);
    }
    
    public static void removeAdsIframes() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) Constant.WEBDRIVER;
            js.executeScript(
                    "document.querySelectorAll(" +
                    "'iframe[id^=\"aswift\"], " +
                    "iframe[src*=\"doubleclick\"], " +
                    "div[id^=\"aswift\"]'" +
                    "div[id=\"ad_position_box\"]'" +
                    ").forEach(e => e.remove());"
                );
        } catch (Exception e) {
            System.out.println("Not fount Ads");
        }
    }
}
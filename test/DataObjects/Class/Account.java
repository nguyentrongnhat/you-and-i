package Class;

public class Account {
	private String email;
    private String password;
    private String nickName;

    public Account(String email, String password) {
		this.email = email;
		this.password = password;
	}
    
    public Account(String email, String password, String nickName) {
		this.email = email;
		this.password = password;
		this.nickName = nickName;
	}

	public String getEmail() {
        return email;
    }

	public String getPassword() {
        return password;
    }

    public void setEmail(String username) {
        this.email = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    

    public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
}

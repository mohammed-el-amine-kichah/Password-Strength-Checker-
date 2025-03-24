document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const passwordField = document.getElementById('generated-password');
    const strengthDisplay = document.getElementById('password-strength');
  
    
    function generatePassword(length = 12) {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    }
  
    // Evaluate password strength using zxcvbn
    function evaluatePassword(password) {
      const result = zxcvbn(password);
      const score = result.score; // 0-4 scale
      let strengthText, strengthColor;
  
      switch (score) {
        case 0:
        case 1:
          strengthText = 'Weak';
          strengthColor = 'red';
          break;
        case 2:
        case 3:
          strengthText = 'Medium';
          strengthColor = 'yellow';
          break;
        case 4:
          strengthText = 'Strong';
          strengthColor = 'green';
          break;
        default:
          strengthText = 'Unknown';
          strengthColor = 'gray';
      }
  
      return { strengthText, strengthColor };
    }
  
    // Event listener for the Generate Password button
    generateBtn.addEventListener('click', () => {
      const newPassword = generatePassword();
      passwordField.value = newPassword;
  
      // Evaluate the generated password
      const { strengthText, strengthColor } = evaluatePassword(newPassword);
      strengthDisplay.textContent = `Strength: ${strengthText}`;
      strengthDisplay.style.color = strengthColor;
    });
  
    // Allow copying the generated password by clicking the input field
    passwordField.addEventListener('click', () => {
      passwordField.select();
      navigator.clipboard.writeText(passwordField.value)
        .then(() => {
          alert('Password copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy password:', err);
        });
    });
  });
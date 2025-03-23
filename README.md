# Password Security Checker Plugin

A browser extension that evaluates password strength in real-time using machine learning while ensuring user privacy.

## Features

- Detects password input fields automatically.
- Provides real-time strength analysis with visual indicators.
- Uses machine learning for advanced password classification.
- Offers actionable suggestions to improve password security.
- Works offline – no passwords are transmitted or stored.
- Compatible with Chrome, Firefox, and Edge.

## Installation

### Chrome / Edge

1. Download the source code from this repository.
2. Open **chrome://extensions/** in your browser.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the extracted project folder.

### Firefox

1. Download the source code from this repository.
2. Open **about****:debugging** in your browser.
3. Click **This Firefox** and then **Load Temporary Add-on**.
4. Select the `manifest.json` file from the extracted project folder.

## Usage

1. Navigate to a website with a password field.
2. Start typing a password.
3. The extension will analyze and display the password strength using color-coded indicators and numerical scores.
4. Hover over the indicator to view security suggestions.

## Technologies Used

- **JavaScript** for core logic.
- **TensorFlow\.js** for machine learning classification.
- **HTML & CSS** for UI elements.
- **Chrome & WebExtensions API** for browser integration.

## Development Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/mohammed-el-amine-kichah/Password-Strength-Checker-
   ```
2. Install dependencies:
   ```sh
   npm install  # If using additional dependencies
   ```
3. Modify and test the extension as needed.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request.

## Security & Privacy

- The extension processes all passwords **locally** within the browser.
- No data is stored or transmitted.

## License

This project is licensed under the MIT License.





const SCORE_MULTIPLIER = 17.5; // ZXCVBN score (0-4) to 0-70 scale
const MIN_LENGTH_FULL_POINTS = 8;
const MIN_LENGTH_PARTIAL_POINTS = 4;
const LENGTH_FULL_POINTS = 6;
const LENGTH_PARTIAL_POINTS = 3;
const CHARACTER_TYPE_POINTS = 6;
const MAX_SCORE = 100;
const SCORE_THRESHOLD_WEAK = 40;
const SCORE_THRESHOLD_MEDIUM = 70;

// Constants for UI
const BAR_HEIGHT = '7px';
const BAR_BORDER_RADIUS = '7px';
const TOOLTIP_WIDTH = '300px';
const STRENGTH_LABEL_MARGIN_LEFT = '15px';


function calculatePasswordStrength(password) {
  const result = zxcvbn(password.slice(0, 100)); // Limit input to 100 characters for performance

  // Map ZXCVBN's score to a 0-70 scale
  let score = result.score * SCORE_MULTIPLIER;

  // Define rules for feedback
  const rules = {
    length: { satisfied: false, message: "At least 8 characters" },
    uppercase: { satisfied: false, message: "At least one uppercase letter" },
    lowercase: { satisfied: false, message: "At least one lowercase letter" },
    number: { satisfied: false, message: "At least one number" },
    special: { satisfied: false, message: "At least one special character" },
    noCommonPatterns: { satisfied: true, message: "No common patterns" }
  };

  // Single regex check for character types
  const charChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  // Update rules and score based on character types
  if (password.length >= MIN_LENGTH_FULL_POINTS) {
    score += LENGTH_FULL_POINTS;
    rules.length.satisfied = true;
  } else if (password.length >= MIN_LENGTH_PARTIAL_POINTS) {
    score += LENGTH_PARTIAL_POINTS;
  }

  if (charChecks.uppercase) {
    score += CHARACTER_TYPE_POINTS;
    rules.uppercase.satisfied = true;
  }
  if (charChecks.lowercase) {
    score += CHARACTER_TYPE_POINTS;
    rules.lowercase.satisfied = true;
  }
  if (charChecks.number) {
    score += CHARACTER_TYPE_POINTS;
    rules.number.satisfied = true;
  }
  if (charChecks.special) {
    score += CHARACTER_TYPE_POINTS;
    rules.special.satisfied = true;
  }

  // Check for common patterns using ZXCVBN's feedback (for tooltip only)
  if (result.feedback.warning) {
    const warningLower = result.feedback.warning.toLowerCase();
    const patternKeywords = ['common', 'pattern', 'dictionary', 'repeats', 'sequences'];
    if (patternKeywords.some(keyword => warningLower.includes(keyword))) {
      rules.noCommonPatterns.satisfied = false;
    }
  }

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(score, MAX_SCORE));

  return { score, rules, feedback: result.feedback };
}


function getUIFeedback(score) {
  let backgroundColor, strengthLabel;
  if (score < SCORE_THRESHOLD_WEAK) {
    backgroundColor = 'red';
    strengthLabel = 'Weak';
  } else if (score < SCORE_THRESHOLD_MEDIUM) {
    backgroundColor = 'yellow';
    strengthLabel = 'Medium';
  } else {
    backgroundColor = 'green';
    strengthLabel = 'Strong';
  }

  const scoreText = `${Math.round(score)}/${MAX_SCORE}`;
  return { backgroundColor, strengthLabel, scoreText };
}


function updateStrengthUI(input, bar) {
  const password = input.value;
  const { score, rules, feedback } = calculatePasswordStrength(password);

  // Show/hide bar and strength label based on password presence
  const shouldDisplay = password.length > 0;
  bar.style.display = shouldDisplay ? 'block' : 'none';
  bar.strengthLabel.style.display = shouldDisplay ? 'inline-block' : 'none';
  bar.rulesTooltip.style.display = shouldDisplay ? 'none' : 'none'; // Hidden by default, shown on hover

  if (!shouldDisplay) return;

  // Update bar width and color
  const { backgroundColor, strengthLabel, scoreText } = getUIFeedback(score);
  bar.style.width = `${score}%`; // Score directly maps to percentage width (100 score = 100% width)
  bar.style.backgroundColor = backgroundColor;
  bar.strengthLabel.textContent = strengthLabel;

  // Update the rules tooltip content
  const rulesList = bar.rulesTooltip.querySelector('ul');
  rulesList.innerHTML = ''; // Clear previous content

  // Add the score at the top of the tooltip
  const scoreLi = document.createElement('li');
  scoreLi.textContent = `Score: ${scoreText}`;
  scoreLi.style.fontWeight = 'bold';
  scoreLi.style.marginBottom = '8px';
  rulesList.appendChild(scoreLi);

  // Add a separator after the score
  const scoreSeparator = document.createElement('hr');
  scoreSeparator.style.border = 'none';
  scoreSeparator.style.borderTop = '1px solid #ccc';
  scoreSeparator.style.margin = '8px 0';
  rulesList.appendChild(scoreSeparator);

  // Add rules with checkmarks or X
  Object.values(rules).forEach(rule => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.marginBottom = '5px';

    const icon = document.createElement('span');
    icon.style.marginRight = '8px';
    icon.style.fontSize = '14px';
    icon.textContent = rule.satisfied ? '✔' : '✘';
    icon.style.color = rule.satisfied ? 'green' : 'red';

    const text = document.createElement('span');
    text.textContent = rule.message;
    text.style.color = rule.satisfied ? 'green' : 'red';

    li.appendChild(icon);
    li.appendChild(text);
    rulesList.appendChild(li);
  });

  // Add ZXCVBN feedback if present
  if (feedback.warning || feedback.suggestions.length > 0) {
    const separator = document.createElement('hr');
    separator.style.border = 'none';
    separator.style.borderTop = '1px solid #ccc';
    separator.style.margin = '8px 0';
    rulesList.appendChild(separator);
  }

  if (feedback.warning) {
    const warningLi = document.createElement('li');
    warningLi.textContent = `Warning: ${feedback.warning}`;
    warningLi.style.color = 'red';
    warningLi.style.fontStyle = 'italic';
    warningLi.style.marginBottom = '5px';
    rulesList.appendChild(warningLi);
  }

  if (feedback.suggestions.length > 0) {
    const suggestionLi = document.createElement('li');
    suggestionLi.textContent = `Tip: ${feedback.suggestions[0]}`; // Show only the first suggestion
    suggestionLi.style.color = '#333';
    suggestionLi.style.fontStyle = 'italic';
    rulesList.appendChild(suggestionLi);
  }
}


function addStrengthBar(input) {
  if (input.dataset.hasStrengthBar) {
    return input.parentElement.querySelector('.strength-bar');
  }

  const parent = input.parentElement;
  if (parent.style.position !== 'relative') {
    parent.style.position = 'relative';
  }

  const container = document.createElement('div');
  container.className = 'strength-container';
  container.style.position = 'absolute';
  container.style.top = '100%';
  container.style.left = '0';
  container.style.right = '0';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.marginTop = '3px';
  container.style.paddingBottom = '30px';
  container.style.zIndex = '1';

  const bar = document.createElement('div');
  bar.className = 'strength-bar';
  bar.style.height = BAR_HEIGHT;
  bar.style.width = '0%';
  bar.style.backgroundColor = 'red';
  bar.style.borderRadius = BAR_BORDER_RADIUS;
  bar.style.transition = 'width 0.3s ease, background-color 0.3s ease';
  bar.style.display = 'none';

  bar.style.cursor = 'pointer';

  const strengthLabel = document.createElement('span');
  strengthLabel.className = 'strength-label';
  strengthLabel.style.fontSize = '12px';
  strengthLabel.style.color = '#000';
  strengthLabel.style.marginLeft = STRENGTH_LABEL_MARGIN_LEFT;
  strengthLabel.style.display = 'none';
  strengthLabel.textContent = 'Weak'; // Default value

  const rulesTooltip = document.createElement('div');
  rulesTooltip.className = 'rules-tooltip';
  rulesTooltip.style.position = 'absolute';
  rulesTooltip.style.top = '100%';
  rulesTooltip.style.left = '0';
  rulesTooltip.style.backgroundColor = '#fff';
  rulesTooltip.style.border = '1px solid #ccc';
  rulesTooltip.style.borderRadius = '5px';
  rulesTooltip.style.padding = '10px';
  rulesTooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  rulesTooltip.style.display = 'none';
  rulesTooltip.style.zIndex = '2';
  rulesTooltip.style.fontSize = '12px';
  rulesTooltip.style.color = '#333';
  rulesTooltip.style.width = TOOLTIP_WIDTH;

  const rulesList = document.createElement('ul');
  rulesList.style.listStyle = 'none';
  rulesList.style.padding = '0';
  rulesList.style.margin = '0';
  rulesTooltip.appendChild(rulesList);

  container.appendChild(bar);
  container.appendChild(strengthLabel);
  container.appendChild(rulesTooltip);

  parent.appendChild(container);

  bar.strengthLabel = strengthLabel;
  bar.rulesTooltip = rulesTooltip;

  bar.addEventListener('mouseenter', () => {
    if (input.value.length > 0) {
      rulesTooltip.style.display = 'block';
    }
  });
  bar.addEventListener('mouseleave', () => {
    rulesTooltip.style.display = 'none';
  });

  input.dataset.hasStrengthBar = 'true';

  return bar;
}

// Function to initialize strength bar for a password input
function initializeStrengthBar(input) {
  const strengthBar = addStrengthBar(input);
  input.addEventListener('input', () => updateStrengthUI(input, strengthBar));
  if (input.value) {
    updateStrengthUI(input, strengthBar);
  }
}

// Detect all password fields and attach listeners
document.querySelectorAll('input[type="password"]').forEach(input => {
  initializeStrengthBar(input);
});

// Observe DOM changes for dynamically loaded password fields
const observer = new MutationObserver((mutations) => {
  let hasNewPasswordInputs = false;
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      const passwordInputs = Array.from(mutation.addedNodes)
        .filter(node => node.nodeType === Node.ELEMENT_NODE)
        .flatMap(node => node.matches('input[type="password"]') ? [node] : Array.from(node.querySelectorAll('input[type="password"]')));
      if (passwordInputs.length > 0) {
        hasNewPasswordInputs = true;
        passwordInputs.forEach(input => {
          if (!input.dataset.hasStrengthBar) {
            initializeStrengthBar(input);
          }
        });
      }
    }
  });

  // Disconnect observer if no new password inputs are found to reduce overhead
  if (!hasNewPasswordInputs && document.querySelectorAll('input[type="password"]').length === document.querySelectorAll('input[type="password"][data-has-strength-bar]').length) {
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
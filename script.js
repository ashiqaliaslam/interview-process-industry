document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        setupHomePage();
    } else if (window.location.pathname.includes('question.html')) {
        setupQuestionPage();
    }
});



function setupHomePage() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.id;
            window.location.href = `question.html?category=${category}`;
        });
    });
}

function setupQuestionPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        updatePageTitle(category);
        loadQuestions(category);
    }
}

function updatePageTitle(category) {
    const titleElement = document.querySelector('.title');
    if (titleElement) {
        titleElement.innerText = `${category.toUpperCase()} TEST`;
    }
}

function loadQuestions(category) {
    // const filePath = `https://ashiqaliaslam.github.io/test-preparation/${category}_questions.json`;
    const filePath = `${category}_questions.json`;
    
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            if (data.questions.length > 0) {
                questions = data.questions;
                currentQuestionIndex = 0; // Reset index for the new category
                displayQuestion(questions[currentQuestionIndex]);
                setupNavigation();
                setupProgressBar(questions.length);
            } else {
                document.querySelector('.question-container').innerText = 'No questions available.';
            }
        })
        .catch(error => console.error('Error loading questions:', error));
}




function displayQuestion(question, questions) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    questionText.innerText = question.question;
    optionsContainer.innerHTML = '';

    // Check if there are answer options
    const hasOptions = (question.wrongAnswers && question.rightAnswers) &&
        (question.wrongAnswers.length > 0 || question.rightAnswers.length > 0);
    
    if (hasOptions) {
        const allAnswers = [...question.wrongAnswers, ...question.rightAnswers];
        allAnswers.sort(() => Math.random() - 0.5); // Shuffle options

        // Determine if we should use checkboxes or radio buttons
        const useRadioButtons = question.rightAnswers.length === 1;

        allAnswers.forEach(answer => {
            const option = document.createElement('div');
            option.className = 'option';

            if (useRadioButtons) {
                // Create a radio button
                const radioButton = document.createElement('input');
                radioButton.type = 'radio';
                radioButton.name = 'answer'; // Ensure all radio buttons share the same name
                radioButton.className = 'radio';
                radioButton.value = answer;
                radioButton.addEventListener('change', () => handleOptionClick(radioButton, answer)); // Use 'change' for radio buttons

                const optionText = document.createElement('span');
                optionText.className = 'option-text';
                optionText.innerText = answer;
                optionText.addEventListener('click', () => radioButton.click()); // Trigger radio button click on text click

                option.appendChild(radioButton);
                option.appendChild(optionText);
            } else {
                // Create a checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'checkbox';
                checkbox.value = answer;
                checkbox.addEventListener('change', () => handleOptionClick(checkbox, answer)); // Use 'change' for checkboxes

                const optionText = document.createElement('span');
                optionText.className = 'option-text';
                optionText.innerText = answer;
                optionText.addEventListener('click', () => checkbox.click()); // Trigger checkbox click on text click

                option.appendChild(checkbox);
                option.appendChild(optionText);
            }

            optionsContainer.appendChild(option);
        });
    } else {
        // Display a message if no options are available
        optionsContainer.innerHTML = '<p style="color:lightgrey; font-size:20px;">Please write a brief or comprehensive answer.</p>';
    }

    updateProgressBar(); // Ensure progress bar is updated after displaying questions

       // Show or hide the tips button based on availability of tips
       const tipsButton = document.querySelector('.tips-button');
       if (question.tips && question.tips.length > 0) {
           tipsButton.style.display = 'block';
       } else {
           tipsButton.style.display = 'none';
       }
}


function handleOptionClick(checkbox, answer) {
    if (checkbox.checked) {
        const question = questions[currentQuestionIndex];
        const isCorrect = question.rightAnswers.includes(answer);
        provideFeedback(isCorrect);
    }
}

function provideFeedback(isCorrect) {
    // Remove existing feedback if any
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create new feedback element
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.innerText = isCorrect ? 'Your answer is correct!' : 'Your answer is wrong.';
    feedback.classList.add(isCorrect ? 'correct' : 'wrong');

    // Add feedback to the page
    document.querySelector('.question-container').appendChild(feedback);

    // Show feedback for a short time
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 2000);
}


let currentQuestionIndex = 0;
let questions = [];

function setupNavigation() {
    const prevButton = document.querySelector('.previous');
    const nextButton = document.querySelector('.next');

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(questions[currentQuestionIndex]);
            updateButtonState();
            updateProgressBar();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(questions[currentQuestionIndex]);
            updateButtonState();
            updateProgressBar();
        } else {
            showCompletionMessage();
        }
    });

    updateButtonState();
}

function updateButtonState() {
    const prevButton = document.querySelector('.previous');
    const nextButton = document.querySelector('.next');

    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

function showCompletionMessage() {
    const correctAnswers = questions.filter(question => {
        return question.rightAnswers && question.rightAnswers.some(ans => document.querySelector(`.option-text:contains(${ans})`).previousElementSibling.checked);
    }).length;
    alert(`You got ${correctAnswers} out of ${questions.length} questions right. Come back soon!`);
}

function setupProgressBar(totalQuestions) {
    updateProgressBar();
}

function updateProgressBar() {
    const progressForeground = document.querySelector('.progress-foreground');
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressForeground.style.width = `${progressPercentage}%`;
}

function showTips() {
    const tipsPopup = document.getElementById('tips-popup');
    const tipsContent = document.getElementById('tips-content');
    const question = questions[currentQuestionIndex];
    
    // Fetch tips for the current question
    if (question.tips) {
        tipsContent.innerHTML = question.tips.join('<br>'); // Display tips
        tipsPopup.style.display = 'block'; // Show popup
    }
}

function closeTips() {
    document.getElementById('tips-popup').style.display = 'none'; // Hide popup
}

// Event listener for the close button
document.querySelector('.close-popup').addEventListener('click', closeTips);

// Close popup when clicking outside of it
window.onclick = function(event) {
    if (event.target === document.getElementById('tips-popup')) {
        closeTips();
    }
}

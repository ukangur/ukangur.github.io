document.addEventListener('DOMContentLoaded', () => {
  const tablinks = document.getElementsByClassName('tablinks');

  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].addEventListener('click', handleTabClick);
  }

  // Fetch data from the server and store it in sessionStorage
  fetch('/api/data')
    .then((response) => response.json())
    .then((data) => {
      sessionStorage.setItem('data', JSON.stringify(data));

      // Initialize the tabs
      if (tablinks && tablinks.length > 0) {
        const initialTabName = tablinks[0].getAttribute('href').substring(1);
        openTab(initialTabName);
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });

  function handleTabClick(event) {
    event.preventDefault();
    const tabName = event.target.getAttribute('href').substring(1);
    openTab(tabName);
  }

  function openTab(tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove('active');
    }

    document.getElementById(tabName).style.display = 'block';
    const targetTabLink = Array.from(tablinks).find((tabLink) => tabLink.getAttribute('href').substring(1) === tabName);
    if (targetTabLink) {
      targetTabLink.classList.add('active');
    }

    if (tabName === 'cv') {
      loadCV();
    } else if (tabName === 'projects') {
      loadProjects();
    }
  }

  function makeEditable(element, saveFunction) {
    if (sessionStorage.getItem('role') === 'admin') {
      element.setAttribute('contenteditable', 'true');
      element.addEventListener('blur', saveFunction); // Save data when the element loses focus
    }
  }

  function formatDate(dateStr) {
    if (!dateStr || dateStr === 'present') return 'Present';
    const [year, month] = dateStr.split('-');
    const monthIndex = parseInt(month) - 1;
    const monthName = monthNames[monthIndex];
    return `${monthName} ${year}`;
  }

  function updateDate(dateElement, property, newValue) {
    const data = JSON.parse(sessionStorage.getItem('data'));
    const cvData = data.cv;
    const dateId = dateElement.parentNode.getAttribute('data-id');
    const cvItem = cvData.workExperience.find((item) => item.id === dateId || item.id.toString() === dateId);
    if (cvItem) {
      cvItem[property] = newValue;
      sessionStorage.setItem('data', JSON.stringify(data));
    }
  }

  function handleStartDateChange(event) {
    const newStartDate = event.target.textContent.trim();
    const dateElement = event.target.parentNode;
    updateDate(dateElement, 'start_date', newStartDate);
  }

  function handleEndDateChange(event) {
    const newEndDate = event.target.textContent.trim();
    const dateElement = event.target.parentNode;
    updateDate(dateElement, 'end_date', newEndDate);
  }

  function loadCV() {
    const cvContainer = document.getElementById('cv-container');
    if (cvContainer.innerHTML.trim()) return;

    const data = JSON.parse(sessionStorage.getItem('data'));
    const cvData = data.cv;

    // Load Work Experience
    const workExperienceHeader = document.createElement('h3');
    workExperienceHeader.textContent = 'Work Experience';
    cvContainer.appendChild(workExperienceHeader);

    const workExperienceList = document.createElement('ul');
    cvData.workExperience.forEach(job => {
      const jobItem = document.createElement('div');
      jobItem.classList.add('cv-item');
    
      const jobTitle = document.createElement('h4');
      const organization = document.createElement('h5');
      const date = document.createElement('h6');
    
      const startDate = formatDate(job.start_date);
      const endDate = formatDate(job.end_date);
    
      jobTitle.innerHTML = `<strong class="work-position">${job.position}</strong>`;
      organization.innerHTML = `<span class="work-company">${job.company}</span>`;
      date.textContent = `${startDate} - ${endDate}`;
    
      jobItem.appendChild(jobTitle);
      jobItem.appendChild(organization);
      jobItem.appendChild(date);
    
      makeEditable(jobTitle.querySelector('.work-position'));
      makeEditable(organization.querySelector('.work-company'));
    
      const responsibilities = document.createElement('p');
      responsibilities.innerHTML = `<strong>Responsibilities:</strong><br> <span class="work-responsibilities">${job.responsibilities.join('<br />')}</span>`;
      jobItem.appendChild(responsibilities);
    
      makeEditable(responsibilities.querySelector('.work-responsibilities'));
    
      const startDateElement = jobTitle.querySelector('.work-position');
      const endDateElement = organization.querySelector('.work-company');
    
      startDateElement.addEventListener('blur', handleStartDateChange);
      endDateElement.addEventListener('blur', handleEndDateChange);
    
      workExperienceList.appendChild(jobItem);
    });

    cvContainer.appendChild(workExperienceList);

    // Load Education
    const educationHeader = document.createElement('h3');
educationHeader.textContent = 'Education';
cvContainer.appendChild(educationHeader);

const educationList = document.createElement('ul');
cvData.education.forEach(education => {
  const educationItem = document.createElement('div');
  educationItem.classList.add('cv-item');

  const degree = document.createElement('h4');
  const institution = document.createElement('h5');
  const date = document.createElement('h6');

  const startDate = formatDate(education.start_date);
  const endDate = formatDate(education.end_date);

  degree.innerHTML = `<strong class="education-degree">${education.degree}</strong>`;
  institution.innerHTML = `<span class="education-institution">${education.institution}</span>`;
  date.textContent = `${startDate} - ${endDate}`;

  educationItem.appendChild(degree);
  educationItem.appendChild(institution);
  educationItem.appendChild(date);

  makeEditable(degree.querySelector('.education-degree'));
  makeEditable(institution.querySelector('.education-institution'));

  if (education.specialization) {
    const specialization = document.createElement('p');
    specialization.innerHTML = `<strong>Specialization:</strong> <span class="education-specialization">${education.specialization}</span>`;
    educationItem.appendChild(specialization);
    makeEditable(specialization.querySelector('.education-specialization'));
  }

  if (education.minor) {
    const minor = document.createElement('p');
    minor.innerHTML = `<strong>Minor:</strong> <span class="education-minor">${education.minor}</span>`;
    educationItem.appendChild(minor);
    makeEditable(minor.querySelector('.education-minor'));
  }

  if (education.thesisTitle) {
    const thesisTitle = document.createElement('p');
    thesisTitle.innerHTML = `<strong>Thesis Title:</strong> <span class="education-thesisTitle">${education.thesisTitle}</span>`;
    educationItem.appendChild(thesisTitle);
    makeEditable(thesisTitle.querySelector('.education-thesisTitle'));
  }

  if (education.thesisSupervisors && education.thesisSupervisors.length > 0) {
    const supervisors = document.createElement('p');
    supervisors.innerHTML = `<strong>Thesis Supervisors:</strong> <span class="education-thesisSupervisors">${education.thesisSupervisors.join(', ')}</span>`;
    educationItem.appendChild(supervisors);
    makeEditable(supervisors.querySelector('.education-thesisSupervisors'));
  }

  const startDateElement = degree.querySelector('.education-degree');
  const endDateElement = institution.querySelector('.education-institution');

  startDateElement.addEventListener('blur', handleStartDateChange);
  endDateElement.addEventListener('blur', handleEndDateChange);

  educationList.appendChild(educationItem);
});

    cvContainer.appendChild(educationList);
  }

  function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer.innerHTML.trim()) return;

    const data = JSON.parse(sessionStorage.getItem('data'));
    const projects = data.projects;

    const projectsHeader = document.createElement('h3');
    projectsHeader.textContent = 'Coding projects';
    projectsContainer.appendChild(projectsHeader);

    makeEditable(projectsHeader);

    const projectList = document.createElement('ul');
    projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.classList.add('project-item');

      if (project.github) {
        projectItem.classList.add('clickable');

        projectItem.addEventListener('click', (event) => {
          event.stopPropagation();
          window.open(project.github, '_blank');
        });
      }
      const projectName = document.createElement('h4');
      projectName.innerHTML = `<strong>${project.name}</strong>`;
      projectItem.appendChild(projectName);

      const projectDescription = document.createElement('p');
      projectDescription.textContent = project.description;
      projectItem.appendChild(projectDescription);

      const projectTechnology = document.createElement('p');
      projectTechnology.innerHTML = `<strong>Technology:</strong> ${project.technology}`;
      projectItem.appendChild(projectTechnology);

      if (project.github) {
        const projectGithub = document.createElement('p');
        projectGithub.innerHTML = `<a href="${project.github}" target="_blank" onclick="event.stopPropagation();">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ffffffa6">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.308.76-1.61-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.3-.54-1.52.105-3.17 0 0 1.005-.322 3.3 1.23A11.62 11.62 0 0 1 12 5.067c1.02-.137 2.04-.205 3.075-.21 2.28-1.552 3.285-1.23 3.285-1.23.645 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.93.42.36.81 1.096.81 2.22 0 1.6-.015 2.89-.015 3.29 0 .32.21.69.825.57C20.565 22.097 24 17.6 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        </a>`;
        projectGithub.addEventListener('click', (event) => {
          event.stopPropagation();
        });
        projectItem.appendChild(projectGithub);
      }

      projectList.appendChild(projectItem);
    });

    projectsContainer.appendChild(projectList);
  }

  // Initialize the tabs
  tablinks[0].click();
});

// Initialize the tabs outside of the DOMContentLoaded event listener
const tablinks = document.getElementsByClassName('tablinks');
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

if (tablinks && tablinks.length > 0) {
  const initialTabName = tablinks[0].getAttribute('href').substring(1);
  openTab(initialTabName);
}
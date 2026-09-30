const GITHUB_USERNAME = 'kd0415b';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;

// 여러 기능의 현재 상태를 한곳에서 관리한다.
const STATE = {
  theme: localStorage.getItem('theme') || 'light',
  menuOpen: false,
  projects: {
    status: 'idle',
    data: [],
    error: null,
  },
  form: {
    name: '',
    email: '',
    message: '',
    errors: {},
  },
};

const elements = {
  header: document.querySelector('.site-header'),
  themeToggle: document.querySelector('#theme-toggle'),
  themeIcon: document.querySelector('.theme-icon'),
  menuToggle: document.querySelector('#menu-toggle'),
  navList: document.querySelector('#nav-list'),
  navLinks: document.querySelectorAll('#nav-list a'),
  projectStatus: document.querySelector('#project-status'),
  projectGrid: document.querySelector('#project-grid'),
  retryButton: document.querySelector('#retry-button'),
  contactForm: document.querySelector('#contact-form'),
  formSuccess: document.querySelector('#form-success'),
  scrollTop: document.querySelector('#scroll-top'),
  currentYear: document.querySelector('#current-year'),
};

function renderTheme() {
  const isDark = STATE.theme === 'dark';

  document.documentElement.dataset.theme = STATE.theme;
  elements.themeIcon.textContent = isDark ? '☀' : '☾';
  elements.themeToggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
}

function toggleTheme() {
  STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', STATE.theme);
  renderTheme();
}

function renderMenu() {
  elements.navList.classList.toggle('is-open', STATE.menuOpen);
  elements.menuToggle.classList.toggle('is-active', STATE.menuOpen);
  elements.menuToggle.setAttribute('aria-expanded', String(STATE.menuOpen));
  elements.menuToggle.setAttribute('aria-label', STATE.menuOpen ? '메뉴 닫기' : '메뉴 열기');
  document.body.classList.toggle('menu-open', STATE.menuOpen);
}

function toggleMenu() {
  STATE.menuOpen = !STATE.menuOpen;
  renderMenu();
}

function closeMenu() {
  if (!STATE.menuOpen) return;
  STATE.menuOpen = false;
  renderMenu();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

function createProjectCard(project) {
  const description = project.description || '저장소 설명이 아직 등록되지 않았습니다.';
  const language = project.language || '기타';

  return `
    <article class="project-card">
      <div class="project-card-top">
        <span>PUBLIC REPOSITORY</span>
        <span aria-label="별 ${project.stargazers_count}개">★ ${project.stargazers_count}</span>
      </div>
      <h3>${escapeHtml(project.name)}</h3>
      <p class="project-description">${escapeHtml(description)}</p>
      <div class="project-meta">
        <span><i class="language-dot" aria-hidden="true"></i>${escapeHtml(language)}</span>
        <span>${formatDate(project.updated_at)}</span>
      </div>
      <a class="button button-secondary" href="${project.html_url}" target="_blank" rel="noreferrer">
        GitHub에서 보기
      </a>
    </article>
  `;
}

function renderProjects() {
  const { status, data } = STATE.projects;

  elements.retryButton.hidden = status !== 'error';
  elements.projectGrid.innerHTML = '';

  if (status === 'loading') {
    elements.projectStatus.hidden = false;
    elements.projectStatus.innerHTML = '<span class="loader" aria-hidden="true"></span><p>프로젝트를 불러오는 중입니다.</p>';
    return;
  }

  if (status === 'error') {
    elements.projectStatus.hidden = false;
    elements.projectStatus.innerHTML = '<strong>프로젝트를 불러오지 못했습니다.</strong><p>네트워크 상태를 확인한 뒤 다시 시도해주세요.</p>';
    return;
  }

  if (status === 'success' && data.length === 0) {
    elements.projectStatus.hidden = false;
    elements.projectStatus.innerHTML = '<strong>표시할 프로젝트가 없습니다.</strong><p>새로운 공개 저장소가 등록되면 이곳에 나타납니다.</p>';
    return;
  }

  elements.projectStatus.hidden = true;
  elements.projectGrid.innerHTML = data.map(createProjectCard).join('');
}

async function loadProjects() {
  STATE.projects.status = 'loading';
  STATE.projects.error = null;
  renderProjects();

  try {
    const response = await fetch(GITHUB_API_URL);

    if (!response.ok) {
      throw new Error(`GitHub API 요청 실패: ${response.status}`);
    }

    const repositories = await response.json();

    // fork가 아닌 저장소만 고른 뒤 최근 프로젝트 6개로 새로운 배열을 만든다.
    STATE.projects.data = repositories
      .filter((repository) => !repository.fork)
      .slice(0, 6)
      .map((repository) => ({
        name: repository.name,
        description: repository.description,
        language: repository.language,
        stargazers_count: repository.stargazers_count,
        updated_at: repository.updated_at,
        html_url: repository.html_url,
      }));
    STATE.projects.status = 'success';
  } catch (error) {
    STATE.projects.status = 'error';
    STATE.projects.error = error.message;
  }

  renderProjects();
}

function validateField(fieldName, value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return fieldName === 'name' ? '이름을 입력해주세요.' : fieldName === 'email' ? '이메일을 입력해주세요.' : '메시지를 입력해주세요.';
  }

  if (fieldName === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedValue)) return '올바른 이메일 형식을 입력해주세요.';
  }

  return '';
}

function renderFieldError(fieldName) {
  const input = elements.contactForm.elements[fieldName];
  const errorElement = document.querySelector(`#${fieldName}-error`);
  const errorMessage = STATE.form.errors[fieldName] || '';

  input.setAttribute('aria-invalid', String(Boolean(errorMessage)));
  errorElement.textContent = errorMessage;
}

function handleFormInput(event) {
  const { name, value } = event.target;
  if (!Object.hasOwn(STATE.form, name)) return;

  STATE.form[name] = value;
  STATE.form.errors[name] = validateField(name, value);
  elements.formSuccess.textContent = '';
  renderFieldError(name);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const fieldNames = ['name', 'email', 'message'];

  fieldNames.forEach((fieldName) => {
    const value = elements.contactForm.elements[fieldName].value;
    STATE.form[fieldName] = value;
    STATE.form.errors[fieldName] = validateField(fieldName, value);
    renderFieldError(fieldName);
  });

  const hasError = Object.values(STATE.form.errors).some(Boolean);

  if (hasError) {
    elements.formSuccess.textContent = '';
    elements.contactForm.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  elements.formSuccess.textContent = '입력 내용이 확인되었습니다. 감사합니다!';
  elements.contactForm.reset();
  STATE.form = { name: '', email: '', message: '', errors: {} };
}

function handleScroll() {
  const hasScrolled = window.scrollY > 24;
  elements.header.classList.toggle('is-scrolled', hasScrolled);
  elements.scrollTop.classList.toggle('is-visible', window.scrollY > 500);
}

function observeSections() {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function initialisePage() {
  renderTheme();
  renderMenu();
  observeSections();
  handleScroll();
  loadProjects();
  elements.currentYear.textContent = new Date().getFullYear();
}

elements.themeToggle.addEventListener('click', toggleTheme);
elements.menuToggle.addEventListener('click', toggleMenu);
elements.navLinks.forEach((link) => link.addEventListener('click', closeMenu));
elements.retryButton.addEventListener('click', loadProjects);
elements.contactForm.addEventListener('input', handleFormInput);
elements.contactForm.addEventListener('submit', handleFormSubmit);
elements.scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) closeMenu();
});

initialisePage();

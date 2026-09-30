# CODYSSEY B1-1 Portfolio

순수 HTML, CSS, JavaScript로 제작한 반응형 자기소개 웹페이지입니다.

## 주요 기능

- 모바일 퍼스트 반응형 레이아웃
- 다크·라이트 테마 전환 및 선택값 저장
- 모바일 햄버거 메뉴와 스크롤 애니메이션
- GitHub API를 활용한 공개 저장소 표시
- API 로딩·성공·오류·빈 상태 처리
- 문의 폼 실시간 유효성 검사
- 맨 위로 이동 버튼

## 파일 구조

```text
codyssey-b1-1/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
```

## 실행 방법

VS Code에서 프로젝트 폴더를 열고 `index.html`을 Live Server로 실행합니다.

## 구현 메모

- HTML은 콘텐츠 구조, CSS는 디자인과 반응형 배치, JavaScript는 상태와 동작을 담당하도록 분리했습니다.
- 반복되는 색상과 크기는 `:root`의 CSS 변수로 관리합니다.
- JavaScript의 `STATE` 객체에서 테마, 메뉴, API, 폼 상태를 한곳에 관리합니다.
- GitHub 데이터는 `filter()`로 fork 저장소를 제외하고 `map()`으로 화면에 필요한 형태로 바꿉니다.

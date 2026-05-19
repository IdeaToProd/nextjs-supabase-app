/**
 * 더미 데이터 유틸리티
 * 실제 API 연동 전 UI 개발을 위한 정적 더미 데이터와 타입 정의
 */

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** 이벤트 정보 */
export interface Event {
  id: string;
  title: string;
  description: string;
  /** ISO 날짜 문자열 */
  date: string;
  location: string;
  /** null이면 정원 제한 없음 */
  maxParticipants: number | null;
  isPublic: boolean;
  status: "upcoming" | "past";
  ownerName: string;
  memberCount: number;
  rsvpCounts: {
    attending: number;
    absent: number;
    pending: number;
  };
}

/** 이벤트 멤버 */
export interface Member {
  id: string;
  name: string;
  email: string;
  /** null이면 플레이스홀더 표시 */
  avatarUrl: string | null;
  role: "owner" | "co-host" | "participant";
  rsvp: "attending" | "absent" | "pending";
  joinedAt: string;
}

/** 공지사항 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
}

/** 정산 */
export interface Settlement {
  id: string;
  title: string;
  totalAmount: number;
  perPersonAmount: number;
  participantCount: number;
  createdAt: string;
}

/** 카풀 탑승자 */
export interface CarpoolPassenger {
  id: string;
  name: string;
}

/** 카풀 차량 */
export interface Carpool {
  id: string;
  driverName: string;
  departure: string;
  seats: number;
  passengers: CarpoolPassenger[];
}

/** 사용자 프로필 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: string;
  isAdmin: boolean;
}

// ─────────────────────────────────────────────
// 더미 데이터
// ─────────────────────────────────────────────

/** 이벤트 더미 데이터 (10개) */
export const dummyEvents: Event[] = [
  {
    id: "1",
    title: "2024 연말 송년회",
    description:
      "한 해를 마무리하며 팀원들과 함께하는 소중한 시간. 맛있는 음식과 함께 올 한 해를 돌아봐요!",
    date: "2025-12-28T18:00:00+09:00",
    location: "강남구 역삼동 레스토랑 비스트로 3층",
    maxParticipants: 30,
    isPublic: true,
    status: "upcoming",
    ownerName: "김지수",
    memberCount: 18,
    rsvpCounts: { attending: 14, absent: 2, pending: 2 },
  },
  {
    id: "2",
    title: "봄 벚꽃 나들이",
    description:
      "여의도 벚꽃길을 함께 걸으며 봄의 기운을 느껴봐요. 도시락 지참 권장!",
    date: "2025-04-05T11:00:00+09:00",
    location: "여의도 윤중로",
    maxParticipants: 20,
    isPublic: true,
    status: "past",
    ownerName: "박민준",
    memberCount: 20,
    rsvpCounts: { attending: 18, absent: 1, pending: 1 },
  },
  {
    id: "3",
    title: "스타트업 네트워킹 밋업",
    description:
      "개발자, 디자이너, PM이 모여 서로의 경험을 나누는 자유로운 네트워킹 자리입니다.",
    date: "2025-06-15T19:00:00+09:00",
    location: "성수동 공유오피스 루프탑",
    maxParticipants: null,
    isPublic: true,
    status: "upcoming",
    ownerName: "이서연",
    memberCount: 42,
    rsvpCounts: { attending: 35, absent: 3, pending: 4 },
  },
  {
    id: "4",
    title: "동창회 정기 모임",
    description:
      "2015년 졸업생 정기 모임입니다. 오랜만에 반가운 얼굴들을 만나요.",
    date: "2025-07-20T17:00:00+09:00",
    location: "마포구 합정역 근처 고깃집",
    maxParticipants: 25,
    isPublic: false,
    status: "upcoming",
    ownerName: "최현우",
    memberCount: 15,
    rsvpCounts: { attending: 10, absent: 3, pending: 2 },
  },
  {
    id: "5",
    title: "독서 모임 — 《파친코》 완독 파티",
    description:
      "3개월간 함께 읽은 《파친코》를 마무리하는 완독 파티입니다. 소감을 나눠요.",
    date: "2025-05-10T14:00:00+09:00",
    location: "홍대입구 북카페 서가앤쿡",
    maxParticipants: 12,
    isPublic: false,
    status: "past",
    ownerName: "정유진",
    memberCount: 12,
    rsvpCounts: { attending: 10, absent: 1, pending: 1 },
  },
  {
    id: "6",
    title: "사내 운동회 — 볼링 대회",
    description:
      "팀별 볼링 대항전! 우승팀에게는 특별 상품이 주어집니다. 많은 참여 바랍니다.",
    date: "2025-08-02T13:00:00+09:00",
    location: "종로 볼링센터 5~8번 레인",
    maxParticipants: 24,
    isPublic: false,
    status: "upcoming",
    ownerName: "한동훈",
    memberCount: 22,
    rsvpCounts: { attending: 20, absent: 1, pending: 1 },
  },
  {
    id: "7",
    title: "제주도 워크숍",
    description:
      "1박 2일 팀 빌딩 워크숍. 오전에는 전략 회의, 오후에는 자유 시간!",
    date: "2025-09-12T10:00:00+09:00",
    location: "제주시 애월읍 펜션",
    maxParticipants: 15,
    isPublic: false,
    status: "upcoming",
    ownerName: "김지수",
    memberCount: 14,
    rsvpCounts: { attending: 13, absent: 0, pending: 1 },
  },
  {
    id: "8",
    title: "UI/UX 스터디 킥오프",
    description:
      "Figma 기초부터 실무 디자인 시스템까지 함께 공부하는 스터디 첫 모임입니다.",
    date: "2025-10-05T10:00:00+09:00",
    location: "온라인 (Google Meet)",
    maxParticipants: 10,
    isPublic: true,
    status: "upcoming",
    ownerName: "이서연",
    memberCount: 8,
    rsvpCounts: { attending: 7, absent: 0, pending: 1 },
  },
  {
    id: "9",
    title: "부서 점심 번개",
    description: "오늘 날씨 좋으니 다 같이 점심 먹으러 나가요!",
    date: "2025-03-15T12:00:00+09:00",
    location: "광화문 광장 근처",
    maxParticipants: 8,
    isPublic: false,
    status: "past",
    ownerName: "박민준",
    memberCount: 7,
    rsvpCounts: { attending: 6, absent: 1, pending: 0 },
  },
  {
    id: "10",
    title: "연간 자선 마라톤",
    description:
      "매년 열리는 자선 마라톤에 함께 참가해요. 5km 코스 / 10km 코스 선택 가능.",
    date: "2025-11-23T07:00:00+09:00",
    location: "한강 뚝섬 유원지",
    maxParticipants: 50,
    isPublic: true,
    status: "upcoming",
    ownerName: "최현우",
    memberCount: 31,
    rsvpCounts: { attending: 25, absent: 2, pending: 4 },
  },
];

/** 멤버 더미 데이터 */
export const dummyMembers: Member[] = [
  {
    id: "m1",
    name: "김지수",
    email: "jisu.kim@example.com",
    avatarUrl: null,
    role: "owner",
    rsvp: "attending",
    joinedAt: "2025-11-01T09:00:00+09:00",
  },
  {
    id: "m2",
    name: "박민준",
    email: "minjun.park@example.com",
    avatarUrl: null,
    role: "co-host",
    rsvp: "attending",
    joinedAt: "2025-11-02T10:30:00+09:00",
  },
  {
    id: "m3",
    name: "이서연",
    email: "seoyeon.lee@example.com",
    avatarUrl: null,
    role: "participant",
    rsvp: "attending",
    joinedAt: "2025-11-03T14:00:00+09:00",
  },
  {
    id: "m4",
    name: "최현우",
    email: "hyunwoo.choi@example.com",
    avatarUrl: null,
    role: "participant",
    rsvp: "absent",
    joinedAt: "2025-11-04T11:00:00+09:00",
  },
  {
    id: "m5",
    name: "정유진",
    email: "yujin.jung@example.com",
    avatarUrl: null,
    role: "participant",
    rsvp: "pending",
    joinedAt: "2025-11-05T16:00:00+09:00",
  },
  {
    id: "m6",
    name: "한동훈",
    email: "donghun.han@example.com",
    avatarUrl: null,
    role: "participant",
    rsvp: "attending",
    joinedAt: "2025-11-06T09:30:00+09:00",
  },
  {
    id: "m7",
    name: "오수빈",
    email: "subin.oh@example.com",
    avatarUrl: null,
    role: "participant",
    rsvp: "attending",
    joinedAt: "2025-11-07T13:00:00+09:00",
  },
];

/** 공지사항 더미 데이터 */
export const dummyNotices: Notice[] = [
  {
    id: "n1",
    title: "장소 변경 안내",
    content:
      "기존 예약된 식당이 사정으로 인해 변경되었습니다. 새 장소는 강남구 역삼동 비스트로 3층이며, 주차 공간이 협소하니 대중교통 이용을 권장합니다.",
    createdAt: "2025-11-10T10:00:00+09:00",
    authorName: "김지수",
  },
  {
    id: "n2",
    title: "드레스코드 안내",
    content:
      "이번 모임의 드레스코드는 세미포멀입니다. 편하게 입으셔도 되지만 너무 캐주얼한 복장은 피해주세요.",
    createdAt: "2025-11-15T15:30:00+09:00",
    authorName: "박민준",
  },
  {
    id: "n3",
    title: "참석 여부 최종 확인 요청",
    content:
      "12월 20일까지 참석 여부를 확정해주세요. 미정으로 남겨두시면 불참으로 처리될 수 있습니다.",
    createdAt: "2025-11-20T09:00:00+09:00",
    authorName: "김지수",
  },
];

/** 정산 더미 데이터 */
export const dummySettlements: Settlement[] = [
  {
    id: "s1",
    title: "저녁 식사비",
    totalAmount: 350000,
    perPersonAmount: 25000,
    participantCount: 14,
    createdAt: "2025-12-29T21:00:00+09:00",
  },
  {
    id: "s2",
    title: "음료 및 케이크",
    totalAmount: 84000,
    perPersonAmount: 6000,
    participantCount: 14,
    createdAt: "2025-12-29T22:00:00+09:00",
  },
];

/** 카풀 더미 데이터 */
export const dummyCarpools: Carpool[] = [
  {
    id: "c1",
    driverName: "김지수",
    departure: "강남역 2번 출구",
    seats: 4,
    passengers: [
      { id: "m3", name: "이서연" },
      { id: "m5", name: "정유진" },
    ],
  },
  {
    id: "c2",
    driverName: "박민준",
    departure: "사당역 4번 출구",
    seats: 3,
    passengers: [
      { id: "m6", name: "한동훈" },
      { id: "m7", name: "오수빈" },
    ],
  },
];

/** 현재 로그인 사용자 (더미) */
export const dummyCurrentUser: UserProfile = {
  id: "u1",
  name: "김지수",
  email: "jisu.kim@example.com",
  avatarUrl: null,
  joinedAt: "2024-03-15T09:00:00+09:00",
  isAdmin: false,
};

/** 어드민용 회원 목록 더미 데이터 */
export const dummyUsers: UserProfile[] = [
  {
    id: "u1",
    name: "김지수",
    email: "jisu.kim@example.com",
    avatarUrl: null,
    joinedAt: "2024-03-15T09:00:00+09:00",
    isAdmin: false,
  },
  {
    id: "u2",
    name: "박민준",
    email: "minjun.park@example.com",
    avatarUrl: null,
    joinedAt: "2024-04-02T14:00:00+09:00",
    isAdmin: false,
  },
  {
    id: "u3",
    name: "이서연",
    email: "seoyeon.lee@example.com",
    avatarUrl: null,
    joinedAt: "2024-05-20T11:30:00+09:00",
    isAdmin: true,
  },
  {
    id: "u4",
    name: "최현우",
    email: "hyunwoo.choi@example.com",
    avatarUrl: null,
    joinedAt: "2024-06-10T09:00:00+09:00",
    isAdmin: false,
  },
  {
    id: "u5",
    name: "정유진",
    email: "yujin.jung@example.com",
    avatarUrl: null,
    joinedAt: "2024-07-01T16:00:00+09:00",
    isAdmin: false,
  },
  {
    id: "u6",
    name: "한동훈",
    email: "donghun.han@example.com",
    avatarUrl: null,
    joinedAt: "2024-08-14T10:00:00+09:00",
    isAdmin: false,
  },
  {
    id: "u7",
    name: "오수빈",
    email: "subin.oh@example.com",
    avatarUrl: null,
    joinedAt: "2024-09-22T13:30:00+09:00",
    isAdmin: false,
  },
  {
    id: "u8",
    name: "윤재원",
    email: "jaewon.yoon@example.com",
    avatarUrl: null,
    joinedAt: "2024-10-05T09:00:00+09:00",
    isAdmin: false,
  },
];

// ─────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────

/**
 * ISO 날짜 문자열을 한국어 날짜로 포맷
 * @example "2025-12-28T18:00:00+09:00" → "2025년 12월 28일 (일) 오후 6:00"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(date);
}

/**
 * ISO 날짜 문자열을 짧은 날짜로 포맷
 * @example "2025-12-28T18:00:00+09:00" → "12월 28일"
 */
export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(date);
}

/**
 * 금액을 한국 원화 포맷으로 변환
 * @example 350000 → "350,000원"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * RSVP 상태 레이블 반환
 */
export function getRsvpLabel(rsvp: Member["rsvp"]): string {
  const labels: Record<Member["rsvp"], string> = {
    attending: "참석",
    absent: "불참",
    pending: "미정",
  };
  return labels[rsvp];
}

/**
 * 역할 레이블 반환
 */
export function getRoleLabel(role: Member["role"]): string {
  const labels: Record<Member["role"], string> = {
    owner: "주최자",
    "co-host": "공동주최",
    participant: "참여자",
  };
  return labels[role];
}

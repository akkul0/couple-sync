import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Language = "tr" | "ru";
type TabKey = "home" | "chat" | "thumb" | "pet" | "games" | "profile";
type GameTabKey = "pixelpaint" | "tictactoe" | "connect4";
type PetRoom = "living" | "kitchen" | "bathroom" | "bedroom";

type MessageRow = {
    id: number;
    room_id: string;
    sender_id: string;
    body: string;
    created_at: string;
};

type ProfileRow = {
    display_name: string | null;
    avatar_color: string | null;
    avatar_emoji: string | null;
};

type TicPlayer = "X" | "O";
type TicCell = TicPlayer | null;

type ConnectPlayer = "X" | "O";
type ConnectCell = ConnectPlayer | null;

type PaintPixelMap = Record<string, string>;

type FoodId = "apple" | "cookie" | "carrot" | "cake";

type FoodItem = {
    id: FoodId;
    hunger: number;
    happiness: number;
};

type PetStats = {
    hunger: number;
    energy: number;
    cleanliness: number;
    happiness: number;
};

type BallState = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
};

type DragMode = "food" | "soap" | "shower" | "ball" | null;

type FoamPoint = {
    x: number;
    y: number;
    size: number;
    attachedToPet: boolean;
};

type DirtySpot = {
    x: number;
    y: number;
};

type PetSaveData = {
    petRoom: PetRoom;
    petStats: PetStats;
    petSleeping: boolean;
    lightsOff: boolean;
    foamPoints: FoamPoint[];
    dirtySpots: DirtySpot[];
    soapPos: { x: number; y: number };
    showerPos: { x: number; y: number };
    ball: BallState;
};

const AVATAR_COLORS = [
    "#f43f5e",
    "#fb7185",
    "#8b5cf6",
    "#3b82f6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
];

const EMOJIS = ["💖", "✨", "🫶", "🌙", "🎀", "🧸", "🌸"];

const PAINT_COLORS = [
    "#000000",
    "#ffffff",
    "#f43f5e",
    "#fb7185",
    "#f59e0b",
    "#eab308",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
];

const FOOD_ITEMS: FoodItem[] = [
    { id: "apple", hunger: 12, happiness: 4 },
    { id: "cookie", hunger: 8, happiness: 8 },
    { id: "carrot", hunger: 10, happiness: 5 },
    { id: "cake", hunger: 15, happiness: 10 },
];

const PIXEL_BOARD_SIZE = 200;
const PIXEL_CANVAS_SIZE = 800;
const EMPTY_COLOR = "#ffffff";

const CONNECT_ROWS = 6;
const CONNECT_COLS = 7;

const PET_MIN = 0;
const PET_MAX = 100;

const PET_CENTER_X = 160;
const PET_CENTER_Y = 270;
const PET_RADIUS = 80;

const ROOM_WIDTH = 340;
const ROOM_HEIGHT = 560;
const BALL_SIZE = 28;

const PET_STORAGE_KEY = "take-me-pet-state-v6";
const LANGUAGE_STORAGE_KEY = "take-me-language-v1";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const translations = {
    tr: {
        appBadge: "♡ Take Me",
        heroTitle: "Couples space, but softer.",
        heroSubtitle: "Senkron chat, Thumb Kiss, oyunlar ve ortak bakılan pet.",
        statStatus: "Durum",
        statActiveRoom: "Aktif oda",
        statMessages: "Mesaj",
        noRoom: "Yok",
        noMail: "mail yok",
        enterName: "İsmini gir",
        profilePreviewName: "İsmini yaz",

        thumbStatus: "Thumb Kiss",
        typingStatus: "Typing",
        connectedRoom: "Bağlı oda",

        typingPartner: "Partner yazıyor",
        typingIdle: "Sakin",

        tabHome: "Ana alan",
        tabChat: "Chat",
        tabThumb: "Thumb Kiss",
        tabPet: "Pet",
        tabGames: "Oyunlar",
        tabProfile: "Profil",

        loginTitle: "Giriş / Kayıt",
        loginSubtitle: "Aynı oda koduyla partnerinle eşleş ve uygulamaya birlikte gir.",
        emailPlaceholder: "mail adresin",
        passwordPlaceholder: "şifre",
        signUp: "Kayıt ol",
        signIn: "Giriş yap",

        homeRoomMatch: "Oda / eşleşme",
        createRoom: "Yeni oda oluştur",
        roomCodePlaceholder: "oda kodu",
        joinRoom: "Odaya gir",
        copyCode: "Kodu kopyala",
        currentRoom: "Şu an odadasın",

        homeTodayArea: "Bugün sizin alanınız",
        homeBond: "Bağ",
        homeLive: "Canlı",
        homeWaiting: "Bekliyor",
        homeChat: "Chat",
        homeTyping: "Typing",
        homeYes: "Evet",
        homeNo: "Hayır",

        chatTitle: "Canlı chat",
        noMessages: "Henüz mesaj yok",
        partnerIsTyping: "Partner yazıyor...",
        messagePlaceholder: "mesaj yaz",
        send: "Gönder",
        roomSummary: "Oda özeti",
        summaryRoom: "Oda",
        summaryTyping: "Typing",
        active: "Aktif",
        passive: "Pasif",

        thumbTitle: "Thumb Kiss",
        bondPanel: "Bağ paneli",
        state: "Durum",
        total: "Toplam",

        petLiving: "Salon",
        petKitchen: "Mutfak",
        petBathroom: "Banyo",
        petBedroom: "Yatak Odası",

        petSharedStatus: "Ortak pet durumu",
        petHunger: "Açlık",
        petEnergy: "Enerji",
        petCleanliness: "Temizlik",
        petHappiness: "Mutluluk",

        livingDesc: "Topu kim oynatırsa diğer tarafta da aynı anda görünür.",
        kitchenDesc: "Biriniz yedirince ikinizde de aynı pet doyar.",
        bathroomDesc: "Köpük ve temizlik de oda genelinde ortaktır.",
        bedroomDesc: "Işığı kapatınca iki tarafta da uyur.",

        bubbleCount: "Köpük",
        dirtCount: "Kir",

        lightsOff: "Işığı kapat",
        lightsOn: "Işığı aç",

        syncTitle: "Senkron",
        syncDesc: "Odaya girince pet state karşı taraftan çekilir ve değişiklikler canlı yayılır.",

        moodTitle: "Ruh hali",
        moodSleeping: "Uyuyor",
        moodHungry: "Aç",
        moodDirty: "Kirli",
        moodHappy: "Mutlu",
        moodTired: "Uykulu",
        moodNormal: "Normal",

        gamesPixel: "Pixel Paint",
        gamesTic: "Tic Tac Toe",
        gamesConnect: "Four in a Row",
        pixelDesc: "Canvas tabanlı 200 x 200 ortak çizim tahtası",
        clearBoard: "Board temizle",
        resetGame: "Oyunu sıfırla",
        liveTwoPlayer: "Canlı 2 oyunculu oyun",
        liveConnectDesc: "Canlı 2 oyunculu bağlantı oyunu",
        mySymbol: "Senin sembolün",
        turnResult: "Sıra / sonuç",
        moveRight: "Hamle hakkı",
        yourTurn: "Sende",
        partnerTurn: "Partnerde",
        finished: "Bitti",
        draw: "Berabere",
        turn: "Sıra",

        profileTitle: "Profil",
        namePlaceholder: "adın",
        saveProfile: "Profili kaydet",
        previewTitle: "Önizleme",
        signOut: "Çıkış yap",

        soap: "Sabun",
        shower: "Duş",

        language: "Dil",
        langTr: "Türkçe",
        langRu: "Русский",

        foodNames: {
            apple: "Elma",
            cookie: "Kurabiye",
            carrot: "Havuç",
            cake: "Pasta",
        },

        statusNotLoggedIn: "Henüz giriş yapılmadı",
        statusNeedEmailPassword: "Mail ve şifre yaz",
        statusSignupOk: "Kayıt başarılı ✅ Şimdi giriş yap",
        statusSignedIn: "Giriş yapıldı ✅",
        statusNeedLogin: "Önce giriş yap",
        statusNeedRoom: "Önce bir odaya gir",
        statusNeedMessage: "Mesaj yaz",
        statusMessageSent: "Mesaj gönderildi ✅",
        statusCopied: "Oda kodu kopyalandı ✅",
        statusRoomCreated: "Oda oluşturuldu ✅ Kod:",
        statusRoomJoined: "Odaya girdin ✅",
        statusRoomNotFound: "Oda bulunamadı",
        statusNeedRoomCode: "Oda kodu yaz",
        statusSavedProfile: "Profil kaydedildi ✅",
        statusLoggedOut: "Çıkış yapıldı",
        statusKissReady: "Hazır",
        statusKissTouched: "Dokunuldu 💗",
        statusKissConnected: "Bağ kuruldu ✨",

        authCheckError: "Kullanıcı kontrol hatası: ",
        signupError: "Kayıt hatası: ",
        signinError: "Giriş hatası: ",
        signoutError: "Çıkış hatası: ",
        saveProfileError: "Profil kaydedilemedi: ",
        roomCreateError: "Oda oluşturulamadı: ",
        roomAddSelfError: "Odaya eklenemedin: ",
        roomJoinError: "Odaya girilemedi: ",
        messagesLoadError: "Mesajlar yüklenemedi: ",
        messageSendError: "Mesaj gönderilemedi: ",
        notYourTurn: "Şu an sıra sende değil",
        foodFedSuffix: "yedirildi ✅",
    },
    ru: {
        appBadge: "♡ Take Me",
        heroTitle: "Пространство для пары, но мягче.",
        heroSubtitle: "Синхронный чат, Thumb Kiss, игры и общий питомец.",
        statStatus: "Статус",
        statActiveRoom: "Активная комната",
        statMessages: "Сообщения",
        noRoom: "Нет",
        noMail: "нет почты",
        enterName: "Введите имя",
        profilePreviewName: "Введите имя",

        thumbStatus: "Thumb Kiss",
        typingStatus: "Печать",
        connectedRoom: "Подключенная комната",

        typingPartner: "Партнёр печатает",
        typingIdle: "Тихо",

        tabHome: "Главная",
        tabChat: "Чат",
        tabThumb: "Thumb Kiss",
        tabPet: "Питомец",
        tabGames: "Игры",
        tabProfile: "Профиль",

        loginTitle: "Вход / Регистрация",
        loginSubtitle: "Подключитесь к партнёру по одному коду комнаты и войдите вместе.",
        emailPlaceholder: "твоя почта",
        passwordPlaceholder: "пароль",
        signUp: "Регистрация",
        signIn: "Войти",

        homeRoomMatch: "Комната / соединение",
        createRoom: "Создать новую комнату",
        roomCodePlaceholder: "код комнаты",
        joinRoom: "Войти в комнату",
        copyCode: "Скопировать код",
        currentRoom: "Сейчас ты в комнате",

        homeTodayArea: "Ваше пространство сегодня",
        homeBond: "Связь",
        homeLive: "Активно",
        homeWaiting: "Ожидание",
        homeChat: "Чат",
        homeTyping: "Печать",
        homeYes: "Да",
        homeNo: "Нет",

        chatTitle: "Живой чат",
        noMessages: "Сообщений пока нет",
        partnerIsTyping: "Партнёр печатает...",
        messagePlaceholder: "напиши сообщение",
        send: "Отправить",
        roomSummary: "Сводка комнаты",
        summaryRoom: "Комната",
        summaryTyping: "Печать",
        active: "Активно",
        passive: "Пассивно",

        thumbTitle: "Thumb Kiss",
        bondPanel: "Панель связи",
        state: "Состояние",
        total: "Всего",

        petLiving: "Гостиная",
        petKitchen: "Кухня",
        petBathroom: "Ванная",
        petBedroom: "Спальня",

        petSharedStatus: "Состояние общего питомца",
        petHunger: "Голод",
        petEnergy: "Энергия",
        petCleanliness: "Чистота",
        petHappiness: "Счастье",

        livingDesc: "Если кто-то катает мяч, он одновременно виден и у другого.",
        kitchenDesc: "Если один кормит, питомец становится сытым у вас обоих.",
        bathroomDesc: "Пена и чистота тоже общие для комнаты.",
        bedroomDesc: "Если выключить свет, он уснёт у вас обоих.",

        bubbleCount: "Пена",
        dirtCount: "Грязь",

        lightsOff: "Выключить свет",
        lightsOn: "Включить свет",

        syncTitle: "Синхронизация",
        syncDesc: "При входе в комнату состояние питомца запрашивается у второй стороны и далее обновляется в реальном времени.",

        moodTitle: "Настроение",
        moodSleeping: "Спит",
        moodHungry: "Голодный",
        moodDirty: "Грязный",
        moodHappy: "Счастлив",
        moodTired: "Сонный",
        moodNormal: "Обычное",

        gamesPixel: "Pixel Paint",
        gamesTic: "Крестики-нолики",
        gamesConnect: "Четыре в ряд",
        pixelDesc: "Общая доска 200 x 200 на canvas",
        clearBoard: "Очистить поле",
        resetGame: "Сбросить игру",
        liveTwoPlayer: "Игра на двоих в реальном времени",
        liveConnectDesc: "Игра на двоих в реальном времени",
        mySymbol: "Твой символ",
        turnResult: "Ход / результат",
        moveRight: "Право хода",
        yourTurn: "Твой ход",
        partnerTurn: "Ход партнёра",
        finished: "Завершено",
        draw: "Ничья",
        turn: "Ход",

        profileTitle: "Профиль",
        namePlaceholder: "твоё имя",
        saveProfile: "Сохранить профиль",
        previewTitle: "Предпросмотр",
        signOut: "Выйти",

        soap: "Мыло",
        shower: "Душ",

        language: "Язык",
        langTr: "Türkçe",
        langRu: "Русский",

        foodNames: {
            apple: "Яблоко",
            cookie: "Печенье",
            carrot: "Морковь",
            cake: "Торт",
        },

        statusNotLoggedIn: "Вход ещё не выполнен",
        statusNeedEmailPassword: "Введите почту и пароль",
        statusSignupOk: "Регистрация успешна ✅ Теперь войди",
        statusSignedIn: "Вход выполнен ✅",
        statusNeedLogin: "Сначала войди",
        statusNeedRoom: "Сначала войди в комнату",
        statusNeedMessage: "Напиши сообщение",
        statusMessageSent: "Сообщение отправлено ✅",
        statusCopied: "Код комнаты скопирован ✅",
        statusRoomCreated: "Комната создана ✅ Код:",
        statusRoomJoined: "Ты вошёл в комнату ✅",
        statusRoomNotFound: "Комната не найдена",
        statusNeedRoomCode: "Введи код комнаты",
        statusSavedProfile: "Профиль сохранён ✅",
        statusLoggedOut: "Выход выполнен",
        statusKissReady: "Готово",
        statusKissTouched: "Касание 💗",
        statusKissConnected: "Связь установлена ✨",

        authCheckError: "Ошибка проверки пользователя: ",
        signupError: "Ошибка регистрации: ",
        signinError: "Ошибка входа: ",
        signoutError: "Ошибка выхода: ",
        saveProfileError: "Не удалось сохранить профиль: ",
        roomCreateError: "Не удалось создать комнату: ",
        roomAddSelfError: "Не удалось добавить тебя в комнату: ",
        roomJoinError: "Не удалось войти в комнату: ",
        messagesLoadError: "Не удалось загрузить сообщения: ",
        messageSendError: "Не удалось отправить сообщение: ",
        notYourTurn: "Сейчас не твой ход",
        foodFedSuffix: "скормлено ✅",
    },
} as const;

function clamp(value: number, min = PET_MIN, max = PET_MAX) {
    return Math.max(min, Math.min(max, value));
}

function randomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getEmptyTicBoard(): TicCell[] {
    return Array.from({ length: 9 }, () => null);
}

function getEmptyConnectBoard(): ConnectCell[][] {
    return Array.from({ length: CONNECT_ROWS }, () =>
        Array.from({ length: CONNECT_COLS }, () => null)
    );
}

function calculateTicWinner(board: TicCell[]): TicPlayer | null {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

function getConnectDropRow(board: ConnectCell[][], col: number): number | null {
    for (let row = CONNECT_ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) return row;
    }
    return null;
}

function calculateConnectWinner(board: ConnectCell[][]): ConnectPlayer | null {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];

    for (let row = 0; row < CONNECT_ROWS; row++) {
        for (let col = 0; col < CONNECT_COLS; col++) {
            const cell = board[row][col];
            if (!cell) continue;

            for (const [dr, dc] of directions) {
                let count = 1;

                for (let step = 1; step < 4; step++) {
                    const nr = row + dr * step;
                    const nc = col + dc * step;

                    if (
                        nr < 0 ||
                        nr >= CONNECT_ROWS ||
                        nc < 0 ||
                        nc >= CONNECT_COLS ||
                        board[nr][nc] !== cell
                    ) {
                        break;
                    }

                    count++;
                }

                if (count >= 4) return cell;
            }
        }
    }

    return null;
}

function panelStyle(extra?: React.CSSProperties): React.CSSProperties {
    return {
        background: "rgba(255,255,255,0.9)",
        borderRadius: 24,
        padding: 20,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 18px 60px rgba(244,63,94,0.10)",
        ...extra,
    };
}

function inputStyle(): React.CSSProperties {
    return {
        width: "100%",
        padding: "14px 16px",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: 14,
        boxSizing: "border-box",
        background: "#fff",
    };
}

function buttonStyle(background: string, color: string = "#fff"): React.CSSProperties {
    return {
        border: "none",
        borderRadius: 16,
        padding: "12px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        background,
        color,
    };
}

function Stat(props: { label: string; value: string }) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: 18,
                padding: 14,
                border: "1px solid rgba(15,23,42,0.05)",
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    color: "#64748b",
                }}
            >
                {props.label}
            </div>
            <div
                style={{
                    marginTop: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e293b",
                    wordBreak: "break-word",
                }}
            >
                {props.value}
            </div>
        </div>
    );
}

function PetBar(props: { label: string; value: number; color: string }) {
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 6,
                    color: "#475569",
                }}
            >
                <span>{props.label}</span>
                <span>{Math.round(props.value)}</span>
            </div>
            <div
                style={{
                    height: 12,
                    background: "#e2e8f0",
                    borderRadius: 999,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${props.value}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: props.color,
                        transition: "width 180ms ease",
                    }}
                />
            </div>
        </div>
    );
}

export default function App() {
    const initialLang =
        (typeof window !== "undefined"
            ? (localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null)
            : null) || "tr";

    const [language, setLanguage] = useState<Language>(initialLang);
    const t = translations[language];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(t.statusNotLoggedIn);
    const [activeTab, setActiveTab] = useState<TabKey>("home");
    const [gamesTab, setGamesTab] = useState<GameTabKey>("pixelpaint");

    const [userId, setUserId] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [avatarColor, setAvatarColor] = useState("#f43f5e");
    const [avatarEmoji, setAvatarEmoji] = useState("💖");

    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [joinedRoomCode, setJoinedRoomCode] = useState("");
    const [joinedRoomId, setJoinedRoomId] = useState("");

    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [draft, setDraft] = useState("");
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [kissState, setKissState] = useState(t.statusKissReady);
    const [kissCount, setKissCount] = useState(0);

    const [selectedPaintColor, setSelectedPaintColor] = useState("#f43f5e");
    const [paintPixels, setPaintPixels] = useState<PaintPixelMap>({});
    const [isPainting, setIsPainting] = useState(false);
    const [brushSize, setBrushSize] = useState(1);

    const [ticBoard, setTicBoard] = useState<TicCell[]>(getEmptyTicBoard());
    const [ticTurn, setTicTurn] = useState<TicPlayer>("X");
    const [ticWinner, setTicWinner] = useState<TicPlayer | "draw" | null>(null);
    const [ticMySymbol, setTicMySymbol] = useState<TicPlayer>("X");

    const [connectBoard, setConnectBoard] = useState<ConnectCell[][]>(getEmptyConnectBoard());
    const [connectTurn, setConnectTurn] = useState<ConnectPlayer>("X");
    const [connectWinner, setConnectWinner] = useState<ConnectPlayer | "draw" | null>(null);
    const [connectMySymbol, setConnectMySymbol] = useState<ConnectPlayer>("X");

    const [petRoom, setPetRoom] = useState<PetRoom>("living");
    const [petStats, setPetStats] = useState<PetStats>({
        hunger: 78,
        energy: 74,
        cleanliness: 68,
        happiness: 82,
    });
    const [petBounce, setPetBounce] = useState(0);
    const [petBlink, setPetBlink] = useState(false);
    const [petSleeping, setPetSleeping] = useState(false);
    const [lightsOff, setLightsOff] = useState(false);

    const [foodDrag, setFoodDrag] = useState<{
        item: FoodItem;
        x: number;
        y: number;
    } | null>(null);
    const [mouthOpen, setMouthOpen] = useState(false);
    const [isChewing, setIsChewing] = useState(false);
    const [chewTick, setChewTick] = useState(0);

    const [foamPoints, setFoamPoints] = useState<FoamPoint[]>([]);
    const [dirtySpots, setDirtySpots] = useState<DirtySpot[]>([
        { x: 38, y: 72 },
        { x: 58, y: 48 },
        { x: 73, y: 70 },
        { x: 28, y: 42 },
    ]);

    const [soapPos, setSoapPos] = useState({ x: 70, y: 500 });
    const [showerPos, setShowerPos] = useState({ x: 290, y: 120 });

    const [ball, setBall] = useState<BallState>({
        x: 90,
        y: 430,
        vx: 0,
        vy: 0,
        active: false,
    });

    const [dragMode, setDragMode] = useState<DragMode>(null);
    const [ballReleaseStart, setBallReleaseStart] = useState<{ x: number; y: number } | null>(null);

    const [eyeLookX, setEyeLookX] = useState(0);
    const [eyeLookY, setEyeLookY] = useState(0);
    const [sparkleBurst, setSparkleBurst] = useState(0);
    const [heartBurst, setHeartBurst] = useState(0);

    const messagesChannelRef = useRef<any>(null);
    const roomChannelRef = useRef<any>(null);
    const typingTimerRef = useRef<number | null>(null);
    const kissTimerRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const petAreaRef = useRef<HTMLDivElement | null>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const saveTimerRef = useRef<number | null>(null);
    const prevDirtyCountRef = useRef<number>(dirtySpots.length);
    const applyingRemotePetRef = useRef(false);
    const petSyncTimerRef = useRef<number | null>(null);

    const pixelSize = useMemo(() => PIXEL_CANVAS_SIZE / PIXEL_BOARD_SIZE, []);

    const petFaceMood = useMemo(() => {
        if (petSleeping) return "sleep";
        if (petStats.hunger < 35) return "hungry";
        if (petStats.cleanliness < 35) return "dirty";
        if (petStats.happiness > 80) return "happy";
        if (petStats.energy < 30) return "tired";
        return "normal";
    }, [petSleeping, petStats]);

    useEffect(() => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        setKissState((prev) => {
            if (
                prev === translations.tr.statusKissReady ||
                prev === translations.ru.statusKissReady
            ) {
                return translations[language].statusKissReady;
            }
            if (
                prev === translations.tr.statusKissTouched ||
                prev === translations.ru.statusKissTouched
            ) {
                return translations[language].statusKissTouched;
            }
            if (
                prev === translations.tr.statusKissConnected ||
                prev === translations.ru.statusKissConnected
            ) {
                return translations[language].statusKissConnected;
            }
            return prev;
        });

        setStatus((prev) => {
            const known = [
                translations.tr.statusNotLoggedIn,
                translations.ru.statusNotLoggedIn,
                translations.tr.statusSignedIn,
                translations.ru.statusSignedIn,
                translations.tr.statusLoggedOut,
                translations.ru.statusLoggedOut,
            ];
            if (known.includes(prev)) {
                if (prev === translations.tr.statusNotLoggedIn || prev === translations.ru.statusNotLoggedIn) {
                    return translations[language].statusNotLoggedIn;
                }
                if (prev === translations.tr.statusSignedIn || prev === translations.ru.statusSignedIn) {
                    return translations[language].statusSignedIn;
                }
                if (prev === translations.tr.statusLoggedOut || prev === translations.ru.statusLoggedOut) {
                    return translations[language].statusLoggedOut;
                }
            }
            return prev;
        });
    }, [language]);

    function foodLabel(foodId: FoodId): string {
        return t.foodNames[foodId];
    }

    function getPetSnapshot(): PetSaveData {
        return {
            petRoom,
            petStats,
            petSleeping,
            lightsOff,
            foamPoints,
            dirtySpots,
            soapPos,
            showerPos,
            ball,
        };
    }

    function applyPetSnapshot(snapshot: PetSaveData) {
        applyingRemotePetRef.current = true;
        setPetRoom(snapshot.petRoom);
        setPetStats(snapshot.petStats);
        setPetSleeping(snapshot.petSleeping);
        setLightsOff(snapshot.lightsOff);
        setFoamPoints(snapshot.foamPoints);
        setDirtySpots(snapshot.dirtySpots);
        setSoapPos(snapshot.soapPos);
        setShowerPos(snapshot.showerPos);
        setBall(snapshot.ball);
        window.setTimeout(() => {
            applyingRemotePetRef.current = false;
        }, 60);
    }

    async function broadcastPetState(reason: string = "update") {
        if (!roomChannelRef.current || !joinedRoomId || !userId) return;

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "pet_state",
            payload: {
                senderId: userId,
                reason,
                state: getPetSnapshot(),
            },
        });
    }

    async function requestPetState() {
        if (!roomChannelRef.current || !joinedRoomId || !userId) return;

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "pet_state_request",
            payload: {
                senderId: userId,
            },
        });
    }

    function schedulePetSync(reason: string = "update") {
        if (applyingRemotePetRef.current) return;
        if (petSyncTimerRef.current !== null) {
            window.clearTimeout(petSyncTimerRef.current);
        }
        petSyncTimerRef.current = window.setTimeout(() => {
            void broadcastPetState(reason);
        }, 140);
    }

    function playTone(
        frequency: number,
        duration = 0.12,
        type: OscillatorType = "sine",
        volume = 0.035
    ) {
        try {
            if (!audioCtxRef.current) {
                const Ctx =
                    window.AudioContext ||
                    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (!Ctx) return;
                audioCtxRef.current = new Ctx();
            }

            const ctx = audioCtxRef.current;
            if (!ctx) return;

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();

            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            oscillator.stop(ctx.currentTime + duration);
        } catch {
            //
        }
    }

    function playPetSound(kind: "eat" | "bath" | "ball" | "sleepOn" | "sleepOff") {
        if (kind === "eat") {
            playTone(520, 0.08, "triangle", 0.035);
            window.setTimeout(() => playTone(460, 0.08, "triangle", 0.03), 80);
            window.setTimeout(() => playTone(400, 0.08, "triangle", 0.025), 160);
        }

        if (kind === "bath") {
            playTone(760, 0.05, "sine", 0.02);
            window.setTimeout(() => playTone(840, 0.05, "sine", 0.02), 60);
        }

        if (kind === "ball") {
            playTone(320, 0.07, "square", 0.03);
            window.setTimeout(() => playTone(420, 0.07, "square", 0.025), 70);
        }

        if (kind === "sleepOn") {
            playTone(280, 0.18, "sine", 0.03);
            window.setTimeout(() => playTone(220, 0.22, "sine", 0.025), 120);
        }

        if (kind === "sleepOff") {
            playTone(240, 0.1, "sine", 0.025);
            window.setTimeout(() => playTone(330, 0.1, "sine", 0.025), 90);
            window.setTimeout(() => playTone(420, 0.1, "sine", 0.025), 180);
        }
    }

    useEffect(() => {
        void checkUser();

        const { data } = supabase.auth.onAuthStateChange(() => {
            void checkUser();
        });

        const stopPaint = () => setIsPainting(false);
        window.addEventListener("mouseup", stopPaint);
        window.addEventListener("touchend", stopPaint);

        const raw = localStorage.getItem(PET_STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as Partial<PetSaveData>;
                if (parsed.petRoom) setPetRoom(parsed.petRoom);
                if (parsed.petStats) setPetStats(parsed.petStats);
                if (typeof parsed.petSleeping === "boolean") setPetSleeping(parsed.petSleeping);
                if (typeof parsed.lightsOff === "boolean") setLightsOff(parsed.lightsOff);
                if (parsed.foamPoints) setFoamPoints(parsed.foamPoints);
                if (parsed.dirtySpots) setDirtySpots(parsed.dirtySpots);
                if (parsed.soapPos) setSoapPos(parsed.soapPos);
                if (parsed.showerPos) setShowerPos(parsed.showerPos);
                if (parsed.ball) setBall(parsed.ball);
            } catch {
                //
            }
        }

        return () => {
            data.subscription.unsubscribe();
            cleanupRealtime();

            if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
            if (kissTimerRef.current !== null) window.clearTimeout(kissTimerRef.current);
            if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
            if (petSyncTimerRef.current !== null) window.clearTimeout(petSyncTimerRef.current);

            window.removeEventListener("mouseup", stopPaint);
            window.removeEventListener("touchend", stopPaint);
        };
    }, []);

    useEffect(() => {
        if (!joinedRoomId || !userId) {
            cleanupRealtime();
            return;
        }

        void loadMessages(joinedRoomId);
        startMessagesRealtime(joinedRoomId);
        startRoomEvents(joinedRoomId);

        window.setTimeout(() => {
            void requestPetState();
        }, 300);
    }, [joinedRoomId, userId]);

    useEffect(() => {
        const data: PetSaveData = getPetSnapshot();

        if (saveTimerRef.current !== null) {
            window.clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(() => {
            localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(data));
        }, 180);
    }, [petRoom, petStats, petSleeping, lightsOff, foamPoints, dirtySpots, soapPos, showerPos, ball]);

    useEffect(() => {
        if (!joinedRoomId || !userId) return;
        schedulePetSync("state-change");
    }, [petRoom, petStats, petSleeping, lightsOff, foamPoints, dirtySpots, soapPos, showerPos, ball]);

    useEffect(() => {
        drawCanvas();
    }, [paintPixels, pixelSize]);

    useEffect(() => {
        const id = window.setInterval(() => {
            setPetBounce((v) => (v + 1) % 1000);
        }, 180);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        const id = window.setInterval(() => {
            setPetBlink(true);
            window.setTimeout(() => setPetBlink(false), 180);
        }, 3200);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        if (!isChewing) return;

        const id = window.setInterval(() => {
            setChewTick((v) => v + 1);
        }, 120);

        return () => window.clearInterval(id);
    }, [isChewing]);

    useEffect(() => {
        const id = window.setInterval(() => {
            setPetStats((prev) => ({
                hunger: clamp(prev.hunger - 0.6),
                energy: clamp(prev.energy + (petSleeping ? 1.8 : -0.45)),
                cleanliness: clamp(prev.cleanliness - 0.35),
                happiness: clamp(
                    prev.happiness -
                    (prev.hunger < 30 || prev.cleanliness < 30 || prev.energy < 25 ? 0.5 : 0.18)
                ),
            }));
        }, 2500);

        return () => window.clearInterval(id);
    }, [petSleeping]);

    useEffect(() => {
        const id = window.setInterval(() => {
            setBall((prev) => {
                if (!prev.active || dragMode === "ball") return prev;

                let x = prev.x + prev.vx;
                let y = prev.y + prev.vy;
                let vx = prev.vx * 0.996;
                let vy = prev.vy + 0.36;

                const left = 16;
                const right = ROOM_WIDTH - BALL_SIZE;
                const floor = ROOM_HEIGHT - 52;
                const ceiling = 18;

                if (x < left) {
                    x = left;
                    vx *= -0.9;
                }
                if (x > right) {
                    x = right;
                    vx *= -0.9;
                }
                if (y < ceiling) {
                    y = ceiling;
                    vy *= -0.8;
                }
                if (y > floor) {
                    y = floor;
                    vy *= -0.74;
                    vx *= 0.985;
                }

                const nearPet = Math.abs(x - (PET_CENTER_X - 14)) < 80 && Math.abs(y - (PET_CENTER_Y + 40)) < 110;

                if (nearPet) {
                    setPetStats((p) => ({
                        ...p,
                        happiness: clamp(p.happiness + 1.0),
                    }));
                }

                const stop = Math.abs(vx) < 0.12 && Math.abs(vy) < 0.3 && y >= floor;
                if (stop) {
                    return { ...prev, x, y: floor, vx: 0, vy: 0, active: false };
                }

                return { x, y, vx, vy, active: true };
            });
        }, 16);

        return () => window.clearInterval(id);
    }, [dragMode]);

    useEffect(() => {
        if (petSleeping) {
            setEyeLookX(0);
            setEyeLookY(0);
            return;
        }

        if (petRoom === "living" && (dragMode === "ball" || ball.active)) {
            const targetX = ball.x + BALL_SIZE / 2;
            const targetY = ball.y + BALL_SIZE / 2;
            const dx = targetX - PET_CENTER_X;
            const dy = targetY - (PET_CENTER_Y - 10);
            const angle = Math.atan2(dy, dx);
            setEyeLookX(Math.cos(angle) * 4);
            setEyeLookY(Math.sin(angle) * 3);
            return;
        }

        setEyeLookX(0);
        setEyeLookY(0);
    }, [petSleeping, petRoom, dragMode, ball]);

    useEffect(() => {
        const prev = prevDirtyCountRef.current;
        const current = dirtySpots.length;

        if (prev > 0 && current === 0) {
            setSparkleBurst(Date.now());
        }

        prevDirtyCountRef.current = current;
    }, [dirtySpots.length]);

    useEffect(() => {
        if (!sparkleBurst) return;
        const id = window.setTimeout(() => setSparkleBurst(0), 1200);
        return () => window.clearTimeout(id);
    }, [sparkleBurst]);

    useEffect(() => {
        if (!heartBurst) return;
        const id = window.setTimeout(() => setHeartBurst(0), 1100);
        return () => window.clearTimeout(id);
    }, [heartBurst]);

    function drawCanvas() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = EMPTY_COLOR;
        ctx.fillRect(0, 0, PIXEL_CANVAS_SIZE, PIXEL_CANVAS_SIZE);

        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;

        for (let i = 0; i <= PIXEL_BOARD_SIZE; i++) {
            const p = i * pixelSize;

            ctx.beginPath();
            ctx.moveTo(p, 0);
            ctx.lineTo(p, PIXEL_CANVAS_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, p);
            ctx.lineTo(PIXEL_CANVAS_SIZE, p);
            ctx.stroke();
        }

        for (const key in paintPixels) {
            const color = paintPixels[key];
            const [r, c] = key.split(":").map(Number);
            if (Number.isNaN(r) || Number.isNaN(c)) continue;

            ctx.fillStyle = color;
            ctx.fillRect(c * pixelSize + 1, r * pixelSize + 1, pixelSize - 1, pixelSize - 1);
        }
    }

    function cleanupRealtime(): void {
        if (messagesChannelRef.current) {
            supabase.removeChannel(messagesChannelRef.current);
            messagesChannelRef.current = null;
        }

        if (roomChannelRef.current) {
            supabase.removeChannel(roomChannelRef.current);
            roomChannelRef.current = null;
        }

        setPartnerTyping(false);
    }

    function startMessagesRealtime(roomId: string): void {
        if (messagesChannelRef.current) {
            supabase.removeChannel(messagesChannelRef.current);
            messagesChannelRef.current = null;
        }

        messagesChannelRef.current = supabase
            .channel(`messages:${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`,
                },
                (payload: any) => {
                    const row = payload.new as MessageRow;

                    setMessages((prev) => {
                        if (prev.some((m) => m.id === row.id)) return prev;
                        return [...prev, row];
                    });
                }
            )
            .subscribe();
    }

    function startRoomEvents(roomId: string): void {
        if (roomChannelRef.current) {
            supabase.removeChannel(roomChannelRef.current);
            roomChannelRef.current = null;
        }

        roomChannelRef.current = supabase
            .channel(`room:${roomId}`)
            .on("broadcast", { event: "typing" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;
                setPartnerTyping(Boolean(payload.isTyping));
            })
            .on("broadcast", { event: "thumbkiss" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;

                setKissState(t.statusKissConnected);
                setKissCount((prev) => prev + 1);

                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

                if (kissTimerRef.current !== null) {
                    window.clearTimeout(kissTimerRef.current);
                }

                kissTimerRef.current = window.setTimeout(() => {
                    setKissState(t.statusKissReady);
                }, 1800);
            })
            .on("broadcast", { event: "paint_pixel" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;

                const row = Number(payload.row);
                const col = Number(payload.col);
                const color = String(payload.color || EMPTY_COLOR);

                if (
                    Number.isNaN(row) ||
                    Number.isNaN(col) ||
                    row < 0 ||
                    row >= PIXEL_BOARD_SIZE ||
                    col < 0 ||
                    col >= PIXEL_BOARD_SIZE
                ) {
                    return;
                }

                setPaintPixels((prev) => ({
                    ...prev,
                    [`${row}:${col}`]: color,
                }));
            })
            .on("broadcast", { event: "paint_clear" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;
                setPaintPixels({});
            })
            .on("broadcast", { event: "tic_move" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;

                const index = Number(payload.index);
                const symbol = payload.symbol as TicPlayer;

                if (Number.isNaN(index) || index < 0 || index > 8) return;
                if (symbol !== "X" && symbol !== "O") return;

                setTicBoard((prev) => {
                    if (prev[index] !== null) return prev;
                    const next = [...prev];
                    next[index] = symbol;

                    const winner = calculateTicWinner(next);
                    if (winner) {
                        setTicWinner(winner);
                    } else if (next.every((cell) => cell !== null)) {
                        setTicWinner("draw");
                    }

                    return next;
                });

                setTicTurn(symbol === "X" ? "O" : "X");
            })
            .on("broadcast", { event: "tic_reset" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;
                setTicBoard(getEmptyTicBoard());
                setTicTurn("X");
                setTicWinner(null);
            })
            .on("broadcast", { event: "connect_move" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;

                const col = Number(payload.col);
                const symbol = payload.symbol as ConnectPlayer;

                if (Number.isNaN(col) || col < 0 || col >= CONNECT_COLS) return;
                if (symbol !== "X" && symbol !== "O") return;

                setConnectBoard((prev) => {
                    const row = getConnectDropRow(prev, col);
                    if (row === null) return prev;

                    const next = prev.map((r) => [...r]);
                    next[row][col] = symbol;

                    const winner = calculateConnectWinner(next);
                    if (winner) {
                        setConnectWinner(winner);
                    } else if (next.every((r) => r.every((cell) => cell !== null))) {
                        setConnectWinner("draw");
                    }

                    return next;
                });

                setConnectTurn(symbol === "X" ? "O" : "X");
            })
            .on("broadcast", { event: "connect_reset" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;
                setConnectBoard(getEmptyConnectBoard());
                setConnectTurn("X");
                setConnectWinner(null);
            })
            .on("broadcast", { event: "pet_state_request" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId) return;
                void broadcastPetState("reply");
            })
            .on("broadcast", { event: "pet_state" }, ({ payload }: any) => {
                if (!payload || payload.senderId === userId || !payload.state) return;
                applyPetSnapshot(payload.state as PetSaveData);
            })
            .subscribe();
    }

    async function sendTyping(isTyping: boolean): Promise<void> {
        if (!roomChannelRef.current || !userId || !joinedRoomId) return;

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "typing",
            payload: { senderId: userId, isTyping },
        });
    }

    async function handleDraftChange(value: string): Promise<void> {
        setDraft(value);

        if (!joinedRoomId || !userId) return;

        if (value.trim()) {
            await sendTyping(true);

            if (typingTimerRef.current !== null) {
                window.clearTimeout(typingTimerRef.current);
            }

            typingTimerRef.current = window.setTimeout(() => {
                void sendTyping(false);
            }, 1400);
        } else {
            await sendTyping(false);
        }
    }

    async function sendThumbKiss(): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        setKissState(t.statusKissTouched);
        setKissCount((prev) => prev + 1);

        if (navigator.vibrate) navigator.vibrate(90);

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "thumbkiss",
            payload: { senderId: userId, at: Date.now() },
        });

        if (kissTimerRef.current !== null) {
            window.clearTimeout(kissTimerRef.current);
        }

        kissTimerRef.current = window.setTimeout(() => {
            setKissState(t.statusKissReady);
        }, 1200);
    }

    function getCanvasCellFromPointer(clientX: number, clientY: number) {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

        const col = Math.floor((x / rect.width) * PIXEL_BOARD_SIZE);
        const row = Math.floor((y / rect.height) * PIXEL_BOARD_SIZE);

        if (
            row < 0 ||
            row >= PIXEL_BOARD_SIZE ||
            col < 0 ||
            col >= PIXEL_BOARD_SIZE
        ) {
            return null;
        }

        return { row, col };
    }

    async function paintAt(row: number, col: number): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        const updates: Array<{ row: number; col: number; color: string }> = [];

        for (let dr = 0; dr < brushSize; dr++) {
            for (let dc = 0; dc < brushSize; dc++) {
                const rr = row + dr;
                const cc = col + dc;

                if (rr >= 0 && rr < PIXEL_BOARD_SIZE && cc >= 0 && cc < PIXEL_BOARD_SIZE) {
                    updates.push({ row: rr, col: cc, color: selectedPaintColor });
                }
            }
        }

        setPaintPixels((prev) => {
            const next = { ...prev };
            for (const item of updates) {
                next[`${item.row}:${item.col}`] = item.color;
            }
            return next;
        });

        for (const item of updates) {
            await roomChannelRef.current.send({
                type: "broadcast",
                event: "paint_pixel",
                payload: {
                    senderId: userId,
                    row: item.row,
                    col: item.col,
                    color: item.color,
                },
            });
        }
    }

    async function clearBoard(): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        setPaintPixels({});

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "paint_clear",
            payload: { senderId: userId },
        });
    }

    async function makeTicMove(index: number): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        if (ticWinner) return;
        if (ticBoard[index] !== null) return;
        if (ticTurn !== ticMySymbol) {
            setStatus(t.notYourTurn);
            return;
        }

        const symbol = ticMySymbol;
        const nextBoard = [...ticBoard];
        nextBoard[index] = symbol;

        setTicBoard(nextBoard);

        const winner = calculateTicWinner(nextBoard);
        if (winner) {
            setTicWinner(winner);
        } else if (nextBoard.every((cell) => cell !== null)) {
            setTicWinner("draw");
        }

        setTicTurn(symbol === "X" ? "O" : "X");

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "tic_move",
            payload: {
                senderId: userId,
                index,
                symbol,
            },
        });
    }

    async function resetTicGame(): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        setTicBoard(getEmptyTicBoard());
        setTicTurn("X");
        setTicWinner(null);

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "tic_reset",
            payload: { senderId: userId },
        });
    }

    async function makeConnectMove(col: number): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        if (connectWinner) return;
        if (connectTurn !== connectMySymbol) {
            setStatus(t.notYourTurn);
            return;
        }

        const row = getConnectDropRow(connectBoard, col);
        if (row === null) return;

        const symbol = connectMySymbol;
        const next = connectBoard.map((r) => [...r]);
        next[row][col] = symbol;

        setConnectBoard(next);

        const winner = calculateConnectWinner(next);
        if (winner) {
            setConnectWinner(winner);
        } else if (next.every((r) => r.every((cell) => cell !== null))) {
            setConnectWinner("draw");
        }

        setConnectTurn(symbol === "X" ? "O" : "X");

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "connect_move",
            payload: {
                senderId: userId,
                col,
                symbol,
            },
        });
    }

    async function resetConnectGame(): Promise<void> {
        if (!roomChannelRef.current || !joinedRoomId || !userId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        setConnectBoard(getEmptyConnectBoard());
        setConnectTurn("X");
        setConnectWinner(null);

        await roomChannelRef.current.send({
            type: "broadcast",
            event: "connect_reset",
            payload: { senderId: userId },
        });
    }

    function getPetAreaPoint(clientX: number, clientY: number) {
        const area = petAreaRef.current;
        if (!area) return null;
        const rect = area.getBoundingClientRect();
        return {
            x: clamp(clientX - rect.left, 0, rect.width),
            y: clamp(clientY - rect.top, 0, rect.height),
            rect,
        };
    }

    function isNearMouth(x: number, y: number) {
        return x > PET_CENTER_X - 38 && x < PET_CENTER_X + 38 && y > PET_CENTER_Y + 6 && y < PET_CENTER_Y + 52;
    }

    function handleGlobalDragMove(clientX: number, clientY: number) {
        const point = getPetAreaPoint(clientX, clientY);
        if (!point) return;

        if (dragMode === "food" && foodDrag) {
            setFoodDrag({ ...foodDrag, x: point.x, y: point.y });
            setMouthOpen(isNearMouth(point.x, point.y));
        }

        if (dragMode === "soap") {
            setSoapPos({
                x: clamp(point.x, 24, ROOM_WIDTH - 24),
                y: clamp(point.y, 24, ROOM_HEIGHT - 24),
            });

            const dx = point.x - PET_CENTER_X;
            const dy = point.y - PET_CENTER_Y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PET_RADIUS + 18) {
                const localX = 50 + (dx / PET_RADIUS) * 50;
                const localY = 50 + (dy / PET_RADIUS) * 50;

                const bubbles = Array.from({ length: 12 }, () => ({
                    x: clamp(localX + (Math.random() * 18 - 9), 10, 90),
                    y: clamp(localY + (Math.random() * 18 - 9), 10, 90),
                    size: 10 + Math.random() * 18,
                    attachedToPet: true,
                }));

                setFoamPoints((prev) => [...prev, ...bubbles].slice(-220));

                setPetStats((prev) => ({
                    ...prev,
                    cleanliness: clamp(prev.cleanliness + 0.25),
                    happiness: clamp(prev.happiness + 0.1),
                }));

                playPetSound("bath");
            }
        }

        if (dragMode === "shower") {
            setShowerPos({
                x: clamp(point.x, 24, ROOM_WIDTH - 24),
                y: clamp(point.y, 24, ROOM_HEIGHT - 24),
            });

            const dx = point.x - PET_CENTER_X;
            const dy = point.y - PET_CENTER_Y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PET_RADIUS + 24) {
                const localX = 50 + (dx / PET_RADIUS) * 50;
                const localY = 50 + (dy / PET_RADIUS) * 50;

                setFoamPoints((prev) =>
                    prev.filter((p) => {
                        if (!p.attachedToPet) return true;
                        const fx = p.x - localX;
                        const fy = p.y - localY;
                        return Math.sqrt(fx * fx + fy * fy) > 14;
                    })
                );

                setDirtySpots((prev) =>
                    prev.filter((p) => {
                        const sx = p.x - localX;
                        const sy = p.y - localY;
                        return Math.sqrt(sx * sx + sy * sy) > 12;
                    })
                );

                setPetStats((prev) => ({
                    ...prev,
                    cleanliness: clamp(prev.cleanliness + 1.4),
                    happiness: clamp(prev.happiness + 0.2),
                }));

                playPetSound("bath");
            }
        }

        if (dragMode === "ball") {
            setBall((prev) => ({
                ...prev,
                x: clamp(point.x - BALL_SIZE / 2, 16, ROOM_WIDTH - BALL_SIZE - 16),
                y: clamp(point.y - BALL_SIZE / 2, 18, ROOM_HEIGHT - 52),
                active: false,
            }));
        }
    }

    function handleGlobalDragEnd(clientX?: number, clientY?: number) {
        if (dragMode === "food" && foodDrag) {
            const inMouth = isNearMouth(foodDrag.x, foodDrag.y);

            if (inMouth) {
                const eatenItem = foodDrag.item;

                setFoodDrag(null);
                setIsChewing(true);
                setMouthOpen(true);
                setChewTick(0);
                setHeartBurst(Date.now());
                playPetSound("eat");

                window.setTimeout(() => {
                    setPetStats((prev) => ({
                        hunger: clamp(prev.hunger + eatenItem.hunger),
                        energy: prev.energy,
                        cleanliness: prev.cleanliness,
                        happiness: clamp(prev.happiness + eatenItem.happiness),
                    }));
                    setStatus(`${foodLabel(eatenItem.id)} ${t.foodFedSuffix}`);
                }, 450);

                window.setTimeout(() => {
                    setIsChewing(false);
                    setMouthOpen(false);
                    setChewTick(0);
                }, 1100);
            } else {
                setFoodDrag(null);
                setMouthOpen(false);
            }
        }

        if (dragMode === "ball" && ballReleaseStart && clientX !== undefined && clientY !== undefined) {
            const dx = clientX - ballReleaseStart.x;
            const dy = clientY - ballReleaseStart.y;

            setBall((prev) => ({
                ...prev,
                vx: dx * 0.12,
                vy: dy * 0.12,
                active: true,
            }));

            setPetStats((prev) => ({
                ...prev,
                happiness: clamp(prev.happiness + 4),
                energy: clamp(prev.energy - 1.5),
            }));

            playPetSound("ball");
        }

        setDragMode(null);
        setBallReleaseStart(null);
    }

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleGlobalDragMove(e.clientX, e.clientY);
        const onMouseUp = (e: MouseEvent) => handleGlobalDragEnd(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            if (dragMode) e.preventDefault();
            handleGlobalDragMove(touch.clientX, touch.clientY);
        };
        const onTouchEnd = (e: TouchEvent) => {
            const touch = e.changedTouches[0];
            handleGlobalDragEnd(touch?.clientX, touch?.clientY);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, [dragMode, foodDrag, ballReleaseStart]);

    async function checkUser(): Promise<void> {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            setStatus(t.authCheckError + error.message);
            return;
        }

        if (!user) {
            setUserId("");
            setUserEmail("");
            setJoinedRoomCode("");
            setJoinedRoomId("");
            setMessages([]);
            setStatus(t.statusNotLoggedIn);
            return;
        }

        setUserId(user.id);
        setUserEmail(user.email || "");
        setStatus(t.statusSignedIn);
        await loadProfile(user.id);
    }

    async function signUp(): Promise<void> {
        if (!email || !password) {
            setStatus(t.statusNeedEmailPassword);
            return;
        }

        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            setStatus(t.signupError + error.message);
            return;
        }

        setStatus(t.statusSignupOk);
    }

    async function signIn(): Promise<void> {
        if (!email || !password) {
            setStatus(t.statusNeedEmailPassword);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setStatus(t.signinError + error.message);
            return;
        }

        setStatus(t.statusSignedIn);
    }

    async function signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setStatus(t.signoutError + error.message);
            return;
        }

        cleanupRealtime();
        setUserId("");
        setUserEmail("");
        setJoinedRoomCode("");
        setJoinedRoomId("");
        setMessages([]);
        setPaintPixels({});
        setTicBoard(getEmptyTicBoard());
        setTicTurn("X");
        setTicWinner(null);
        setConnectBoard(getEmptyConnectBoard());
        setConnectTurn("X");
        setConnectWinner(null);
        setStatus(t.statusLoggedOut);
    }

    async function loadProfile(id: string): Promise<void> {
        const { data, error } = await supabase
            .from("profiles")
            .select("display_name, avatar_color, avatar_emoji")
            .eq("id", id)
            .maybeSingle();

        if (error || !data) return;

        const row = data as ProfileRow;
        setDisplayName(row.display_name || "");
        setAvatarColor(row.avatar_color || "#f43f5e");
        setAvatarEmoji(row.avatar_emoji || "💖");
    }

    async function saveProfile(): Promise<void> {
        if (!userId) {
            setStatus(t.statusNeedLogin);
            return;
        }

        const { error } = await supabase.from("profiles").upsert({
            id: userId,
            display_name: displayName,
            avatar_color: avatarColor,
            avatar_emoji: avatarEmoji,
        });

        if (error) {
            setStatus(t.saveProfileError + error.message);
            return;
        }

        setStatus(t.statusSavedProfile);
    }

    async function createRoom(): Promise<void> {
        if (!userId) {
            setStatus(t.statusNeedLogin);
            return;
        }

        const code = randomCode();

        const { data: room, error: roomError } = await supabase
            .from("rooms")
            .insert({ code, created_by: userId })
            .select()
            .single();

        if (roomError) {
            setStatus(t.roomCreateError + roomError.message);
            return;
        }

        const { error: memberError } = await supabase.from("room_members").upsert(
            { room_id: room.id, user_id: userId },
            { onConflict: "room_id,user_id", ignoreDuplicates: true }
        );

        if (memberError) {
            setStatus(t.roomAddSelfError + memberError.message);
            return;
        }

        setJoinedRoomCode(code);
        setJoinedRoomId(room.id);
        setRoomCodeInput(code);
        setMessages([]);
        setPaintPixels({});
        setTicBoard(getEmptyTicBoard());
        setTicTurn("X");
        setTicWinner(null);
        setTicMySymbol("X");
        setConnectBoard(getEmptyConnectBoard());
        setConnectTurn("X");
        setConnectWinner(null);
        setConnectMySymbol("X");
        setActiveTab("chat");
        setStatus(`${t.statusRoomCreated} ${code}`);
    }

    async function joinRoom(): Promise<void> {
        if (!userId) {
            setStatus(t.statusNeedLogin);
            return;
        }

        const cleanCode = roomCodeInput.trim().toUpperCase();

        if (!cleanCode) {
            setStatus(t.statusNeedRoomCode);
            return;
        }

        const { data: room, error: roomError } = await supabase
            .from("rooms")
            .select("*")
            .eq("code", cleanCode)
            .single();

        if (roomError || !room) {
            setStatus(t.statusRoomNotFound);
            return;
        }

        const { error: memberError } = await supabase.from("room_members").upsert(
            { room_id: room.id, user_id: userId },
            { onConflict: "room_id,user_id", ignoreDuplicates: true }
        );

        if (memberError) {
            setStatus(t.roomJoinError + memberError.message);
            return;
        }

        setJoinedRoomCode(room.code);
        setJoinedRoomId(room.id);
        setMessages([]);
        setPaintPixels({});
        setTicBoard(getEmptyTicBoard());
        setTicTurn("X");
        setTicWinner(null);
        setTicMySymbol("O");
        setConnectBoard(getEmptyConnectBoard());
        setConnectTurn("X");
        setConnectWinner(null);
        setConnectMySymbol("O");
        setActiveTab("chat");
        setStatus(t.statusRoomJoined);
    }

    async function copyRoomCode(): Promise<void> {
        if (!joinedRoomCode) return;
        await navigator.clipboard.writeText(joinedRoomCode);
        setStatus(t.statusCopied);
    }

    async function loadMessages(roomId: string): Promise<void> {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("room_id", roomId)
            .order("created_at", { ascending: true });

        if (error) {
            setStatus(t.messagesLoadError + error.message);
            return;
        }

        setMessages((data as MessageRow[]) || []);
    }

    async function sendMessage(): Promise<void> {
        if (!userId) {
            setStatus(t.statusNeedLogin);
            return;
        }

        if (!joinedRoomId) {
            setStatus(t.statusNeedRoom);
            return;
        }

        const text = draft.trim();
        if (!text) {
            setStatus(t.statusNeedMessage);
            return;
        }

        setDraft("");
        await sendTyping(false);

        const { error } = await supabase.from("messages").insert({
            room_id: joinedRoomId,
            sender_id: userId,
            body: text,
        });

        if (error) {
            setStatus(t.messageSendError + error.message);
            return;
        }

        setStatus(t.statusMessageSent);
    }

    function renderTabButton(tab: TabKey, label: string) {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                style={{
                    ...buttonStyle(isActive ? "#111827" : "#ffffff", isActive ? "#fff" : "#374151"),
                    border: isActive ? "none" : "1px solid #e5e7eb",
                    minWidth: 110,
                }}
            >
                {label}
            </button>
        );
    }

    function renderGamesTabButton(tab: GameTabKey, label: string) {
        const isActive = gamesTab === tab;
        return (
            <button
                onClick={() => setGamesTab(tab)}
                style={{
                    ...buttonStyle(isActive ? "#f43f5e" : "#ffffff", isActive ? "#fff" : "#374151"),
                    border: isActive ? "none" : "1px solid #e5e7eb",
                    minWidth: 120,
                }}
            >
                {label}
            </button>
        );
    }

    function renderPetRoomButton(room: PetRoom, label: string) {
        const isActive = petRoom === room;
        return (
            <button
                onClick={() => setPetRoom(room)}
                style={{
                    ...buttonStyle(isActive ? "#f43f5e" : "#ffffff", isActive ? "#fff" : "#374151"),
                    border: isActive ? "none" : "1px solid #e5e7eb",
                    minWidth: 120,
                }}
            >
                {label}
            </button>
        );
    }

    function ticStatusText(): string {
        if (ticWinner === "draw") return t.draw;
        if (ticWinner) return `${ticWinner} ${language === "tr" ? "kazandı" : "победил"}`;
        return `${t.turn}: ${ticTurn}`;
    }

    function connectStatusText(): string {
        if (connectWinner === "draw") return t.draw;
        if (connectWinner) return `${connectWinner} ${language === "tr" ? "kazandı" : "победил"}`;
        return `${t.turn}: ${connectTurn}`;
    }

    function moodText(): string {
        if (petSleeping) return t.moodSleeping;
        if (petFaceMood === "hungry") return t.moodHungry;
        if (petFaceMood === "dirty") return t.moodDirty;
        if (petFaceMood === "happy") return t.moodHappy;
        if (petFaceMood === "tired") return t.moodTired;
        return t.moodNormal;
    }

    const loggedIn = Boolean(userId);
    const sleepScale = petSleeping ? 1 + Math.sin(petBounce * 0.08) * 0.02 : 1;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "radial-gradient(circle at top, #ffe4ec 0%, #fff7fb 42%, #f8fafc 82%)",
                color: "#0f172a",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            }}
        >
            <div style={{ maxWidth: 1180, margin: "0 auto", padding: 24 }}>
                <div
                    style={{
                        display: "grid",
                        gap: 16,
                        gridTemplateColumns: "1.15fr 0.85fr",
                        marginBottom: 20,
                    }}
                >
                    <div style={panelStyle({ padding: 28 })}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffe4ec",
                                color: "#be185d",
                                padding: "8px 12px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 12,
                            }}
                        >
                            {t.appBadge}
                        </div>

                        <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.05 }}>{t.heroTitle}</h1>

                        <p style={{ marginTop: 14, color: "#475569", fontSize: 16 }}>{t.heroSubtitle}</p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                                gap: 12,
                                marginTop: 20,
                            }}
                        >
                            <Stat label={t.statStatus} value={status} />
                            <Stat label={t.statActiveRoom} value={joinedRoomCode || "-"} />
                            <Stat label={t.statMessages} value={String(messages.length)} />
                        </div>
                    </div>

                    <div
                        style={{
                            ...panelStyle(),
                            background: "linear-gradient(145deg,#111827,#1f2937)",
                            color: "#fff",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div
                                    style={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: 24,
                                        background: avatarColor,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 32,
                                    }}
                                >
                                    {avatarEmoji}
                                </div>

                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{displayName || t.enterName}</div>
                                    <div style={{ fontSize: 14, color: "#cbd5e1" }}>{userEmail || t.noMail}</div>
                                </div>
                            </div>

                            <div
                                style={{
                                    minWidth: 150,
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: 16,
                                    padding: 12,
                                }}
                            >
                                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: "#cbd5e1", marginBottom: 8 }}>
                                    {t.language}
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => setLanguage("tr")}
                                        style={{
                                            ...buttonStyle(language === "tr" ? "#f43f5e" : "#ffffff", language === "tr" ? "#fff" : "#111827"),
                                            padding: "8px 12px",
                                            flex: 1,
                                        }}
                                    >
                                        {t.langTr}
                                    </button>
                                    <button
                                        onClick={() => setLanguage("ru")}
                                        style={{
                                            ...buttonStyle(language === "ru" ? "#f43f5e" : "#ffffff", language === "ru" ? "#fff" : "#111827"),
                                            padding: "8px 12px",
                                            flex: 1,
                                        }}
                                    >
                                        {t.langRu}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                            <div style={{ background: "rgba(255,255,255,0.09)", padding: 14, borderRadius: 18 }}>
                                {t.thumbStatus}: <b>{kissState}</b>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.09)", padding: 14, borderRadius: 18 }}>
                                {t.typingStatus}: <b>{partnerTyping ? t.typingPartner : t.typingIdle}</b>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.09)", padding: 14, borderRadius: 18 }}>
                                {t.connectedRoom}: <b>{joinedRoomCode || t.noRoom}</b>
                            </div>
                        </div>
                    </div>
                </div>

                {!loggedIn ? (
                    <div style={{ ...panelStyle(), maxWidth: 600, margin: "0 auto", padding: 28 }}>
                        <h2 style={{ marginTop: 0 }}>{t.loginTitle}</h2>
                        <p style={{ color: "#64748b", marginBottom: 20 }}>{t.loginSubtitle}</p>

                        <input
                            type="email"
                            placeholder={t.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ ...inputStyle(), marginBottom: 12 }}
                        />

                        <input
                            type="password"
                            placeholder={t.passwordPlaceholder}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ ...inputStyle(), marginBottom: 16 }}
                        />

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button onClick={() => void signUp()} style={buttonStyle("#111827")}>
                                {t.signUp}
                            </button>
                            <button onClick={() => void signIn()} style={buttonStyle("#f43f5e")}>
                                {t.signIn}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                                background: "rgba(255,255,255,0.74)",
                                padding: 10,
                                borderRadius: 24,
                                marginBottom: 20,
                                border: "1px solid rgba(255,255,255,0.7)",
                            }}
                        >
                            {renderTabButton("home", t.tabHome)}
                            {renderTabButton("chat", t.tabChat)}
                            {renderTabButton("thumb", t.tabThumb)}
                            {renderTabButton("pet", t.tabPet)}
                            {renderTabButton("games", t.tabGames)}
                            {renderTabButton("profile", t.tabProfile)}
                        </div>

                        {activeTab === "home" && (
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.homeRoomMatch}</h2>

                                    <button
                                        onClick={() => void createRoom()}
                                        style={{ ...buttonStyle("#f43f5e"), marginBottom: 16 }}
                                    >
                                        {t.createRoom}
                                    </button>

                                    <input
                                        type="text"
                                        placeholder={t.roomCodePlaceholder}
                                        value={roomCodeInput}
                                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                                        style={{ ...inputStyle(), marginBottom: 12 }}
                                    />

                                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                        <button onClick={() => void joinRoom()} style={buttonStyle("#111827")}>
                                            {t.joinRoom}
                                        </button>
                                        <button onClick={() => void copyRoomCode()} style={buttonStyle("#f3f4f6", "#374151")}>
                                            {t.copyCode}
                                        </button>
                                    </div>

                                    {joinedRoomCode && (
                                        <p style={{ marginTop: 16, color: "#475569" }}>
                                            {t.currentRoom}: <b>{joinedRoomCode}</b>
                                        </p>
                                    )}
                                </div>

                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.homeTodayArea}</h2>

                                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                                        <div style={{ ...panelStyle(), padding: 16, background: "#fff1f2" }}>
                                            <div style={{ fontSize: 12, color: "#64748b" }}>{t.homeBond}</div>
                                            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>
                                                {joinedRoomCode ? t.homeLive : t.homeWaiting}
                                            </div>
                                        </div>

                                        <div style={{ ...panelStyle(), padding: 16, background: "#faf5ff" }}>
                                            <div style={{ fontSize: 12, color: "#64748b" }}>{t.homeChat}</div>
                                            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>
                                                {messages.length} {language === "tr" ? "mesaj" : "сообщений"}
                                            </div>
                                        </div>

                                        <div style={{ ...panelStyle(), padding: 16, background: "#fffbeb" }}>
                                            <div style={{ fontSize: 12, color: "#64748b" }}>{t.homeTyping}</div>
                                            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>
                                                {partnerTyping ? t.homeYes : t.homeNo}
                                            </div>
                                        </div>

                                        <div style={{ ...panelStyle(), padding: 16, background: "#ecfeff" }}>
                                            <div style={{ fontSize: 12, color: "#64748b" }}>{t.thumbTitle}</div>
                                            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{kissCount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 300px" }}>
                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.chatTitle}</h2>

                                    <div
                                        style={{
                                            background: "rgba(248,250,252,0.8)",
                                            borderRadius: 24,
                                            padding: 16,
                                            minHeight: 420,
                                            maxHeight: 520,
                                            overflow: "auto",
                                            marginBottom: 16,
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p style={{ color: "#64748b" }}>{t.noMessages}</p>
                                        ) : (
                                            messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        maxWidth: "82%",
                                                        marginLeft: msg.sender_id === userId ? "auto" : 0,
                                                        marginBottom: 12,
                                                        padding: "12px 14px",
                                                        borderRadius: 20,
                                                        background: msg.sender_id === userId ? "#111827" : "#ffffff",
                                                        color: msg.sender_id === userId ? "#fff" : "#1f2937",
                                                        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                                                    }}
                                                >
                                                    <div>{msg.body}</div>
                                                    <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>{msg.created_at}</div>
                                                </div>
                                            ))
                                        )}

                                        {partnerTyping && (
                                            <div
                                                style={{
                                                    maxWidth: "82%",
                                                    marginBottom: 12,
                                                    padding: "12px 14px",
                                                    borderRadius: 20,
                                                    background: "#ffffff",
                                                    color: "#64748b",
                                                    boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                                                }}
                                            >
                                                {t.partnerIsTyping}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: 12 }}>
                                        <input
                                            type="text"
                                            placeholder={t.messagePlaceholder}
                                            value={draft}
                                            onChange={(e) => {
                                                void handleDraftChange(e.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") void sendMessage();
                                            }}
                                            style={inputStyle()}
                                        />
                                        <button onClick={() => void sendMessage()} style={buttonStyle("#f43f5e")}>
                                            {t.send}
                                        </button>
                                    </div>
                                </div>

                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.roomSummary}</h2>
                                    <div style={{ display: "grid", gap: 12 }}>
                                        <Stat label={t.summaryRoom} value={joinedRoomCode || "-"} />
                                        <Stat label={t.statMessages} value={String(messages.length)} />
                                        <Stat label={t.summaryTyping} value={partnerTyping ? t.active : t.passive} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "thumb" && (
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 300px" }}>
                                <div
                                    style={{
                                        ...panelStyle({
                                            padding: 24,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, #ffe4ec 0%, #fff1f2 50%, #fff7ed 100%)",
                                        }),
                                    }}
                                >
                                    <h2 style={{ marginTop: 0 }}>{t.thumbTitle}</h2>

                                    <button
                                        onClick={() => void sendThumbKiss()}
                                        style={{
                                            width: 280,
                                            height: 280,
                                            borderRadius: "999px",
                                            border: "8px solid #fecdd3",
                                            background: "#fff",
                                            fontSize: 72,
                                            cursor: "pointer",
                                            boxShadow: "0 22px 90px rgba(244,63,94,0.22)",
                                        }}
                                    >
                                        💗
                                    </button>

                                    <div style={{ marginTop: 20, fontSize: 22, fontWeight: 700 }}>{kissState}</div>
                                </div>

                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.bondPanel}</h2>
                                    <div style={{ display: "grid", gap: 12 }}>
                                        <Stat label={t.state} value={kissState} />
                                        <Stat label={t.total} value={String(kissCount)} />
                                        <Stat label={t.summaryRoom} value={joinedRoomCode || "-"} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "pet" && (
                            <div style={{ display: "grid", gap: 16 }}>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {renderPetRoomButton("living", t.petLiving)}
                                    {renderPetRoomButton("kitchen", t.petKitchen)}
                                    {renderPetRoomButton("bathroom", t.petBathroom)}
                                    {renderPetRoomButton("bedroom", t.petBedroom)}
                                </div>

                                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 340px" }}>
                                    <div
                                        ref={petAreaRef}
                                        style={{
                                            ...panelStyle({
                                                minHeight: ROOM_HEIGHT,
                                                position: "relative",
                                                overflow: "hidden",
                                                background:
                                                    petRoom === "bedroom"
                                                        ? lightsOff
                                                            ? "linear-gradient(180deg,#0f172a,#1e293b)"
                                                            : "linear-gradient(180deg,#dbeafe,#f8fafc)"
                                                        : petRoom === "bathroom"
                                                            ? "linear-gradient(180deg,#dff6ff,#f8fafc)"
                                                            : petRoom === "kitchen"
                                                                ? "linear-gradient(180deg,#fff7ed,#f8fafc)"
                                                                : "linear-gradient(180deg,#fee2e2,#f8fafc)",
                                            }),
                                        }}
                                    >
                                        {petRoom === "bedroom" && lightsOff && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    background: "rgba(15,23,42,0.48)",
                                                    pointerEvents: "none",
                                                }}
                                            />
                                        )}

                                        <div
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                height: 120,
                                                background:
                                                    petRoom === "bathroom"
                                                        ? "#bfdbfe"
                                                        : petRoom === "bedroom"
                                                            ? "#c7d2fe"
                                                            : petRoom === "kitchen"
                                                                ? "#fed7aa"
                                                                : "#bbf7d0",
                                            }}
                                        />

                                        {petRoom === "bedroom" && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 50,
                                                    bottom: 70,
                                                    width: 240,
                                                    height: 90,
                                                    background: "#f9a8d4",
                                                    borderRadius: 24,
                                                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                                }}
                                            />
                                        )}

                                        <div
                                            style={{
                                                position: "absolute",
                                                left: PET_CENTER_X - PET_RADIUS,
                                                top:
                                                    petSleeping
                                                        ? 236
                                                        : PET_CENTER_Y - PET_RADIUS + Math.sin(petBounce / 2) * 3,
                                                width: PET_RADIUS * 2,
                                                height: PET_RADIUS * 2,
                                                borderRadius: "999px",
                                                background:
                                                    petFaceMood === "dirty"
                                                        ? "#a78bfa"
                                                        : petFaceMood === "happy"
                                                            ? "#fb7185"
                                                            : "#f472b6",
                                                boxShadow: sparkleBurst
                                                    ? "0 0 0 10px rgba(255,255,255,0.15), 0 0 38px rgba(255,255,255,0.8), 0 22px 50px rgba(244,63,94,0.18)"
                                                    : "0 22px 50px rgba(244,63,94,0.18)",
                                                transition: "top 120ms linear, background 180ms ease, box-shadow 220ms ease",
                                                transform: `scale(${sleepScale})`,
                                            }}
                                        >
                                            {foamPoints
                                                .filter((p) => p.attachedToPet)
                                                .map((p, i) => (
                                                    <div
                                                        key={`pet-foam-${p.x}-${p.y}-${i}`}
                                                        style={{
                                                            position: "absolute",
                                                            left: `${p.x}%`,
                                                            top: `${p.y}%`,
                                                            width: p.size,
                                                            height: p.size,
                                                            borderRadius: "999px",
                                                            background: "rgba(255,255,255,0.94)",
                                                            boxShadow: `0 0 0 ${Math.max(4, p.size / 3)}px rgba(255,255,255,0.26)`,
                                                            transform: "translate(-50%, -50%)",
                                                            pointerEvents: "none",
                                                        }}
                                                    />
                                                ))}

                                            {dirtySpots.map((spot, i) => (
                                                <div
                                                    key={`${spot.x}-${spot.y}-${i}`}
                                                    style={{
                                                        position: "absolute",
                                                        left: `${spot.x}%`,
                                                        top: `${spot.y}%`,
                                                        width: 18,
                                                        height: 12,
                                                        borderRadius: 999,
                                                        background: "rgba(71,85,105,0.45)",
                                                        transform: "translate(-50%, -50%) rotate(-18deg)",
                                                    }}
                                                />
                                            ))}

                                            {sparkleBurst ? (
                                                <>
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            left: 18,
                                                            top: 28,
                                                            fontSize: 20,
                                                            animation: "floatUp 1.1s ease forwards",
                                                        }}
                                                    >
                                                        ✨
                                                    </div>
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            right: 18,
                                                            top: 36,
                                                            fontSize: 18,
                                                            animation: "floatUp 1s ease forwards",
                                                        }}
                                                    >
                                                        ✨
                                                    </div>
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            left: 50,
                                                            bottom: 26,
                                                            fontSize: 18,
                                                            animation: "floatUp 0.95s ease forwards",
                                                        }}
                                                    >
                                                        ✨
                                                    </div>
                                                </>
                                            ) : null}

                                            {heartBurst ? (
                                                <>
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            left: 40,
                                                            top: 18,
                                                            fontSize: 18,
                                                            animation: "floatUp 1s ease forwards",
                                                        }}
                                                    >
                                                        💗
                                                    </div>
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            right: 36,
                                                            top: 16,
                                                            fontSize: 16,
                                                            animation: "floatUp 1.05s ease forwards",
                                                        }}
                                                    >
                                                        💖
                                                    </div>
                                                </>
                                            ) : null}

                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 42,
                                                    top: 52,
                                                    width: 24,
                                                    height: petBlink || petSleeping ? 4 : 26,
                                                    borderRadius: 999,
                                                    background: "#111827",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {!petBlink && !petSleeping && (
                                                    <div
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "999px",
                                                            background: "#ffffff",
                                                            transform: `translate(${7 + eyeLookX}px, ${7 + eyeLookY}px)`,
                                                            transition: "transform 120ms ease",
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    position: "absolute",
                                                    right: 42,
                                                    top: 52,
                                                    width: 24,
                                                    height: petBlink || petSleeping ? 4 : 26,
                                                    borderRadius: 999,
                                                    background: "#111827",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {!petBlink && !petSleeping && (
                                                    <div
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "999px",
                                                            background: "#ffffff",
                                                            transform: `translate(${7 + eyeLookX}px, ${7 + eyeLookY}px)`,
                                                            transition: "transform 120ms ease",
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 58,
                                                    right: 58,
                                                    bottom: 38,
                                                    height: isChewing
                                                        ? chewTick % 2 === 0
                                                            ? 28
                                                            : 12
                                                        : mouthOpen
                                                            ? 30
                                                            : petSleeping
                                                                ? 8
                                                                : petFaceMood === "hungry"
                                                                    ? 10
                                                                    : petFaceMood === "happy"
                                                                        ? 18
                                                                        : 12,
                                                    borderRadius: "0 0 999px 999px",
                                                    background: petSleeping ? "#334155" : "#111827",
                                                    transition: "height 120ms ease",
                                                    transform: isChewing
                                                        ? `translateY(${chewTick % 2 === 0 ? 1 : -1}px)`
                                                        : "none",
                                                }}
                                            />
                                        </div>

                                        {petSleeping && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 286,
                                                    top: 170,
                                                    color: lightsOff ? "#fff" : "#64748b",
                                                    fontWeight: 800,
                                                    fontSize: 28,
                                                }}
                                            >
                                                ZzZ
                                            </div>
                                        )}

                                        {foodDrag && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: foodDrag.x,
                                                    top: foodDrag.y,
                                                    transform: "translate(-50%, -50%)",
                                                    fontSize: 42,
                                                    pointerEvents: "none",
                                                    zIndex: 20,
                                                }}
                                            >
                                                {foodDrag.item.id === "apple"
                                                    ? "🍎"
                                                    : foodDrag.item.id === "cookie"
                                                        ? "🍪"
                                                        : foodDrag.item.id === "carrot"
                                                            ? "🥕"
                                                            : "🍰"}
                                            </div>
                                        )}

                                        {petRoom === "living" && (
                                            <div
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setDragMode("ball");
                                                    setBallReleaseStart({ x: e.clientX, y: e.clientY });
                                                    setBall((prev) => ({ ...prev, active: false }));
                                                }}
                                                onTouchStart={(e) => {
                                                    const touch = e.touches[0];
                                                    setDragMode("ball");
                                                    setBallReleaseStart({ x: touch.clientX, y: touch.clientY });
                                                    setBall((prev) => ({ ...prev, active: false }));
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    left: ball.x,
                                                    top: ball.y,
                                                    width: BALL_SIZE,
                                                    height: BALL_SIZE,
                                                    borderRadius: "999px",
                                                    background: "#f59e0b",
                                                    boxShadow: "0 8px 18px rgba(245,158,11,0.28)",
                                                    cursor: "grab",
                                                    touchAction: "none",
                                                    zIndex: 10,
                                                }}
                                            />
                                        )}

                                        {petRoom === "bathroom" && (
                                            <>
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setDragMode("soap");
                                                    }}
                                                    onTouchStart={() => setDragMode("soap")}
                                                    style={{
                                                        position: "absolute",
                                                        left: soapPos.x,
                                                        top: soapPos.y,
                                                        transform: "translate(-50%, -50%)",
                                                        width: 72,
                                                        height: 42,
                                                        borderRadius: 18,
                                                        background: "linear-gradient(180deg,#fb7185,#f43f5e)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "grab",
                                                        touchAction: "none",
                                                        boxShadow: "0 10px 20px rgba(244,63,94,0.18)",
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    {t.soap}
                                                </div>

                                                <div
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setDragMode("shower");
                                                    }}
                                                    onTouchStart={() => setDragMode("shower")}
                                                    style={{
                                                        position: "absolute",
                                                        left: showerPos.x,
                                                        top: showerPos.y,
                                                        transform: "translate(-50%, -50%)",
                                                        width: 74,
                                                        height: 42,
                                                        borderRadius: 18,
                                                        background: "linear-gradient(180deg,#7dd3fc,#0284c7)",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "grab",
                                                        touchAction: "none",
                                                        boxShadow: "0 10px 20px rgba(2,132,199,0.18)",
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    {t.shower}
                                                </div>
                                            </>
                                        )}

                                        {petRoom === "kitchen" && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 16,
                                                    right: 16,
                                                    bottom: 18,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                    zIndex: 5,
                                                }}
                                            >
                                                {FOOD_ITEMS.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onMouseDown={(e) => {
                                                            const point = getPetAreaPoint(e.clientX, e.clientY);
                                                            if (!point) return;
                                                            setDragMode("food");
                                                            setFoodDrag({
                                                                item,
                                                                x: point.x,
                                                                y: point.y,
                                                            });
                                                        }}
                                                        onTouchStart={(e) => {
                                                            const touch = e.touches[0];
                                                            const point = getPetAreaPoint(touch.clientX, touch.clientY);
                                                            if (!point) return;
                                                            setDragMode("food");
                                                            setFoodDrag({
                                                                item,
                                                                x: point.x,
                                                                y: point.y,
                                                            });
                                                        }}
                                                        style={{
                                                            ...buttonStyle("#fff", "#111827"),
                                                            border: "1px solid #e5e7eb",
                                                            fontSize: 18,
                                                            touchAction: "none",
                                                        }}
                                                    >
                                                        {item.id === "apple"
                                                            ? "🍎"
                                                            : item.id === "cookie"
                                                                ? "🍪"
                                                                : item.id === "carrot"
                                                                    ? "🥕"
                                                                    : "🍰"}{" "}
                                                        {foodLabel(item.id)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "grid", gap: 16 }}>
                                        <div style={panelStyle()}>
                                            <h3 style={{ marginTop: 0 }}>{t.petSharedStatus}</h3>
                                            <div style={{ display: "grid", gap: 12 }}>
                                                <PetBar label={t.petHunger} value={petStats.hunger} color="#f97316" />
                                                <PetBar label={t.petEnergy} value={petStats.energy} color="#6366f1" />
                                                <PetBar label={t.petCleanliness} value={petStats.cleanliness} color="#06b6d4" />
                                                <PetBar label={t.petHappiness} value={petStats.happiness} color="#f43f5e" />
                                            </div>
                                        </div>

                                        {petRoom === "living" && (
                                            <div style={panelStyle()}>
                                                <h3 style={{ marginTop: 0 }}>{t.petLiving}</h3>
                                                <p style={{ color: "#64748b", marginTop: 0 }}>{t.livingDesc}</p>
                                            </div>
                                        )}

                                        {petRoom === "kitchen" && (
                                            <div style={panelStyle()}>
                                                <h3 style={{ marginTop: 0 }}>{t.petKitchen}</h3>
                                                <p style={{ color: "#64748b", marginTop: 0 }}>{t.kitchenDesc}</p>
                                            </div>
                                        )}

                                        {petRoom === "bathroom" && (
                                            <div style={panelStyle()}>
                                                <h3 style={{ marginTop: 0 }}>{t.petBathroom}</h3>
                                                <p style={{ color: "#64748b", marginTop: 0 }}>{t.bathroomDesc}</p>
                                                <div style={{ color: "#475569", fontSize: 14 }}>
                                                    {t.bubbleCount}: {foamPoints.length} • {t.dirtCount}: {dirtySpots.length}
                                                </div>
                                            </div>
                                        )}

                                        {petRoom === "bedroom" && (
                                            <div style={panelStyle()}>
                                                <h3 style={{ marginTop: 0 }}>{t.petBedroom}</h3>
                                                <p style={{ color: "#64748b", marginTop: 0 }}>{t.bedroomDesc}</p>
                                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                    <button
                                                        onClick={() => {
                                                            const next = !lightsOff;
                                                            setLightsOff(next);
                                                            setPetSleeping(next);
                                                            playPetSound(next ? "sleepOn" : "sleepOff");
                                                        }}
                                                        style={buttonStyle(lightsOff ? "#6366f1" : "#111827")}
                                                    >
                                                        {lightsOff ? t.lightsOn : t.lightsOff}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div style={panelStyle()}>
                                            <h3 style={{ marginTop: 0 }}>{t.moodTitle}</h3>
                                            <div style={{ color: "#475569" }}>{moodText()}</div>
                                        </div>

                                        <div style={panelStyle()}>
                                            <h3 style={{ marginTop: 0 }}>{t.syncTitle}</h3>
                                            <div style={{ color: "#475569", fontSize: 14 }}>{t.syncDesc}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "games" && (
                            <div style={{ display: "grid", gap: 16 }}>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {renderGamesTabButton("pixelpaint", t.gamesPixel)}
                                    {renderGamesTabButton("tictactoe", t.gamesTic)}
                                    {renderGamesTabButton("connect4", t.gamesConnect)}
                                </div>

                                {gamesTab === "pixelpaint" && (
                                    <div style={panelStyle({ padding: 24 })}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 16,
                                                alignItems: "center",
                                                marginBottom: 16,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <h2 style={{ margin: 0 }}>{t.gamesPixel}</h2>
                                                <p style={{ marginTop: 8, color: "#64748b" }}>{t.pixelDesc}</p>
                                            </div>

                                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                <button
                                                    onClick={() => setBrushSize(1)}
                                                    style={buttonStyle(brushSize === 1 ? "#111827" : "#e5e7eb", brushSize === 1 ? "#fff" : "#111827")}
                                                >
                                                    1px
                                                </button>
                                                <button
                                                    onClick={() => setBrushSize(2)}
                                                    style={buttonStyle(brushSize === 2 ? "#111827" : "#e5e7eb", brushSize === 2 ? "#fff" : "#111827")}
                                                >
                                                    2px
                                                </button>
                                                <button onClick={() => void clearBoard()} style={buttonStyle("#111827")}>
                                                    {t.clearBoard}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                                            {PAINT_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedPaintColor(color)}
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: 10,
                                                        border: selectedPaintColor === color ? "3px solid #111827" : "1px solid #cbd5e1",
                                                        background: color,
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <canvas
                                            ref={canvasRef}
                                            width={PIXEL_CANVAS_SIZE}
                                            height={PIXEL_CANVAS_SIZE}
                                            onMouseDown={(e) => {
                                                setIsPainting(true);
                                                const cell = getCanvasCellFromPointer(e.clientX, e.clientY);
                                                if (cell) void paintAt(cell.row, cell.col);
                                            }}
                                            onMouseMove={(e) => {
                                                if (!isPainting) return;
                                                const cell = getCanvasCellFromPointer(e.clientX, e.clientY);
                                                if (cell) void paintAt(cell.row, cell.col);
                                            }}
                                            onTouchStart={(e) => {
                                                e.preventDefault();
                                                setIsPainting(true);
                                                const touch = e.touches[0];
                                                const cell = getCanvasCellFromPointer(touch.clientX, touch.clientY);
                                                if (cell) void paintAt(cell.row, cell.col);
                                            }}
                                            onTouchMove={(e) => {
                                                e.preventDefault();
                                                if (!isPainting) return;
                                                const touch = e.touches[0];
                                                const cell = getCanvasCellFromPointer(touch.clientX, touch.clientY);
                                                if (cell) void paintAt(cell.row, cell.col);
                                            }}
                                            onTouchEnd={() => setIsPainting(false)}
                                            style={{
                                                width: "100%",
                                                maxWidth: 800,
                                                borderRadius: 16,
                                                background: "#fff",
                                                border: "1px solid #cbd5e1",
                                                touchAction: "none",
                                                display: "block",
                                            }}
                                        />
                                    </div>
                                )}

                                {gamesTab === "tictactoe" && (
                                    <div style={panelStyle({ padding: 24 })}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 16,
                                                alignItems: "center",
                                                marginBottom: 16,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <h2 style={{ margin: 0 }}>{t.gamesTic}</h2>
                                                <p style={{ marginTop: 8, color: "#64748b" }}>{t.liveTwoPlayer}</p>
                                            </div>

                                            <button onClick={() => void resetTicGame()} style={buttonStyle("#111827")}>
                                                {t.resetGame}
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 12,
                                                gridTemplateColumns: "1fr 320px",
                                                alignItems: "start",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(3, 110px)",
                                                    gap: 10,
                                                    width: "fit-content",
                                                }}
                                            >
                                                {ticBoard.map((cell, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => void makeTicMove(index)}
                                                        style={{
                                                            width: 110,
                                                            height: 110,
                                                            borderRadius: 20,
                                                            border: "1px solid #e5e7eb",
                                                            background: "#fff",
                                                            fontSize: 42,
                                                            fontWeight: 800,
                                                            cursor: "pointer",
                                                            color:
                                                                cell === "X"
                                                                    ? "#f43f5e"
                                                                    : cell === "O"
                                                                        ? "#3b82f6"
                                                                        : "#94a3b8",
                                                            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                                                        }}
                                                    >
                                                        {cell || ""}
                                                    </button>
                                                ))}
                                            </div>

                                            <div style={{ display: "grid", gap: 12 }}>
                                                <Stat label={t.mySymbol} value={ticMySymbol} />
                                                <Stat label={t.turnResult} value={ticStatusText()} />
                                                <Stat
                                                    label={t.moveRight}
                                                    value={
                                                        !ticWinner && ticTurn === ticMySymbol
                                                            ? t.yourTurn
                                                            : ticWinner
                                                                ? t.finished
                                                                : t.partnerTurn
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {gamesTab === "connect4" && (
                                    <div style={panelStyle({ padding: 24 })}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 16,
                                                alignItems: "center",
                                                marginBottom: 16,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <h2 style={{ margin: 0 }}>{t.gamesConnect}</h2>
                                                <p style={{ marginTop: 8, color: "#64748b" }}>{t.liveConnectDesc}</p>
                                            </div>

                                            <button onClick={() => void resetConnectGame()} style={buttonStyle("#111827")}>
                                                {t.resetGame}
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 12,
                                                gridTemplateColumns: "1fr 320px",
                                                alignItems: "start",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: `repeat(${CONNECT_COLS}, 64px)`,
                                                        gap: 8,
                                                        marginBottom: 10,
                                                        width: "fit-content",
                                                    }}
                                                >
                                                    {Array.from({ length: CONNECT_COLS }, (_, col) => (
                                                        <button
                                                            key={col}
                                                            onClick={() => void makeConnectMove(col)}
                                                            style={{
                                                                width: 64,
                                                                height: 40,
                                                                borderRadius: 14,
                                                                border: "none",
                                                                background: "#111827",
                                                                color: "#fff",
                                                                fontWeight: 700,
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            ↓
                                                        </button>
                                                    ))}
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: `repeat(${CONNECT_COLS}, 64px)`,
                                                        gap: 8,
                                                        background: "#1d4ed8",
                                                        padding: 10,
                                                        borderRadius: 20,
                                                        width: "fit-content",
                                                    }}
                                                >
                                                    {connectBoard.flatMap((row, rowIndex) =>
                                                        row.map((cell, colIndex) => (
                                                            <div
                                                                key={`${rowIndex}-${colIndex}`}
                                                                style={{
                                                                    width: 64,
                                                                    height: 64,
                                                                    borderRadius: "999px",
                                                                    background:
                                                                        cell === "X"
                                                                            ? "#f43f5e"
                                                                            : cell === "O"
                                                                                ? "#facc15"
                                                                                : "#ffffff",
                                                                    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.18)",
                                                                }}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "grid", gap: 12 }}>
                                                <Stat label={t.mySymbol} value={connectMySymbol} />
                                                <Stat label={t.turnResult} value={connectStatusText()} />
                                                <Stat
                                                    label={t.moveRight}
                                                    value={
                                                        !connectWinner && connectTurn === connectMySymbol
                                                            ? t.yourTurn
                                                            : connectWinner
                                                                ? t.finished
                                                                : t.partnerTurn
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "0.95fr 1.05fr" }}>
                                <div style={panelStyle({ padding: 24 })}>
                                    <h2 style={{ marginTop: 0 }}>{t.profileTitle}</h2>

                                    <input
                                        type="text"
                                        placeholder={t.namePlaceholder}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        style={{ ...inputStyle(), marginBottom: 12 }}
                                    />

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                                        {EMOJIS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => setAvatarEmoji(emoji)}
                                                style={{
                                                    border: "1px solid #e5e7eb",
                                                    background: avatarEmoji === emoji ? "#111827" : "#fff",
                                                    color: avatarEmoji === emoji ? "#fff" : "#111827",
                                                    borderRadius: 16,
                                                    padding: "10px 14px",
                                                    fontSize: 22,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
                                        {AVATAR_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setAvatarColor(color)}
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 14,
                                                    border:
                                                        avatarColor === color ? "3px solid #111827" : "2px solid transparent",
                                                    background: color,
                                                    cursor: "pointer",
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <button onClick={() => void saveProfile()} style={buttonStyle("#f43f5e")}>
                                        {t.saveProfile}
                                    </button>
                                </div>

                                <div
                                    style={{
                                        ...panelStyle({
                                            padding: 24,
                                            background: "linear-gradient(135deg, #fff1f2, #faf5ff)",
                                        }),
                                    }}
                                >
                                    <h2 style={{ marginTop: 0 }}>{t.previewTitle}</h2>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 16,
                                            background: "rgba(255,255,255,0.88)",
                                            borderRadius: 22,
                                            padding: 18,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 22,
                                                background: avatarColor,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 34,
                                            }}
                                        >
                                            {avatarEmoji}
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>
                                                {displayName || t.profilePreviewName}
                                            </div>
                                            <div style={{ color: "#64748b", fontSize: 14 }}>{userEmail || t.noMail}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                            <button onClick={() => void signOut()} style={buttonStyle("#ffffff", "#374151")}>
                                {t.signOut}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.85);
          }
          20% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-26px) scale(1.08);
          }
        }
      `}</style>
        </div>
    );
}
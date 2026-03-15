import { useState, useEffect, useRef } from "react";
import {
  ChakraProvider,
  Box,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Store } from "@tauri-apps/plugin-store";
import { I18nProvider, useI18n, Language } from "./i18n";
import { TitleBar } from "./components/TitleBar";
import { Sidebar, Page } from "./components/Sidebar";
import { UserPanel } from "./components/UserPanel";
import { PageTransition } from "./components/PageTransition";
import {
  Home,
  Search,
  Random,
  Explore,
  Artists,
  KaraokePlaylist,
  KaraokeQuiz,
  ListenTogether,
  Radio,
  About,
  Favorites,
  Downloads,
  Playlists,
  Uploaded,
  ArtGallery,
  VideoLibrary,
  AudioClips,
  CommunityCanvas,
  Quotes,
  ThemeSettings,
  BaseTheme,
  AccentTheme,
} from "./pages";
import { createAppTheme } from "./theme";

const STORE_NAME = "app-store.json";

const accentColors = {
  neuro: "#40d8ff",
  "neuro-evil": "#a057ff",
  evil: "#f90e6a",
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [baseTheme, setBaseTheme] = useState<BaseTheme>("dark");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("neuro");
  const [store, setStore] = useState<Store | null>(null);
  const { language, setLanguage } = useI18n();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const accentColor = accentColors[accentTheme];

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const storeInstance = await Store.load(STORE_NAME);
        if (!mounted) return;

        setStore(storeInstance);

        const [savedBaseTheme, savedAccentTheme] = await Promise.all([
          storeInstance.get<BaseTheme>("base-theme"),
          storeInstance.get<AccentTheme>("accent-theme"),
        ]);

        if (mounted) {
          if (savedBaseTheme) setBaseTheme(savedBaseTheme);
          if (savedAccentTheme) setAccentTheme(savedAccentTheme);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBaseThemeChange = async (theme: BaseTheme) => {
    setBaseTheme(theme);
    if (store) {
      await store.set("base-theme", theme);
      await store.save();
    }
  };

  const handleAccentThemeChange = async (theme: AccentTheme) => {
    setAccentTheme(theme);
    if (store) {
      await store.set("accent-theme", theme);
      await store.save();
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    // 滚动侧边栏使选中项可见
    setTimeout(() => {
      const activeElement = document.querySelector(`[data-page="${page}"]`);
      if (activeElement && sidebarRef.current) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);
  };

  const theme = createAppTheme(baseTheme, accentTheme);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "search":
        return <Search />;
      case "random":
        return <Random />;
      case "explore":
        return <Explore />;
      case "artists":
        return <Artists />;
      case "karaokePlaylist":
        return <KaraokePlaylist />;
      case "karaokeQuiz":
        return <KaraokeQuiz />;
      case "listenTogether":
        return <ListenTogether />;
      case "radio":
        return <Radio />;
      case "about":
        return <About />;
      case "favorites":
        return <Favorites />;
      case "downloads":
        return <Downloads />;
      case "playlists":
        return <Playlists />;
      case "uploaded":
        return <Uploaded />;
      case "artGallery":
        return <ArtGallery />;
      case "videoLibrary":
        return <VideoLibrary />;
      case "audioClips":
        return <AudioClips />;
      case "communityCanvas":
        return <CommunityCanvas />;
      case "quotes":
        return <Quotes />;
      case "settings":
        return (
          <ThemeSettings
            baseTheme={baseTheme}
            accentTheme={accentTheme}
            language={language}
            onBaseThemeChange={handleBaseThemeChange}
            onAccentThemeChange={handleAccentThemeChange}
            onLanguageChange={handleLanguageChange}
          />
        );
      default:
        return <Home />;
    }
  };

  return (
    <ChakraProvider theme={theme} key={baseTheme}>
      <Box
        w="100vw"
        h="100vh"
        bg={baseTheme === "dark" ? "#1a1a1a" : "#ffffff"}
        color={baseTheme === "dark" ? "white" : "#1a1a1a"}
        overflow="hidden"
        transition="background-color 0.3s ease"
      >
        <Flex direction="column" h="full">
          <TitleBar baseTheme={baseTheme} />

          <HStack flex={1} overflow="hidden" align="stretch" gap={0}>
            <Box h="full" display="flex" flexDirection="column">
              <Sidebar
                ref={sidebarRef}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                accentColor={accentColor}
                baseTheme={baseTheme}
              />
              <UserPanel
                onSettingsClick={() => handlePageChange("settings")}
                onLanguageChange={handleLanguageChange}
                currentLanguage={language}
                accentColor={accentColor}
                baseTheme={baseTheme}
              />
            </Box>

            <Box
              flex={1}
              overflow="auto"
              bg={baseTheme === "dark" ? "#1a1a1a" : "#ffffff"}
              position="relative"
            >
              <AnimatePresence mode="wait">
                <PageTransition key={currentPage}>
                  {renderPage()}
                </PageTransition>
              </AnimatePresence>
            </Box>
          </HStack>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;

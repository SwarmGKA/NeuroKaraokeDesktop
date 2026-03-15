import { forwardRef } from "react";
import { VStack, Button, Box, Text, HStack, IconButton } from "@chakra-ui/react";
import { useI18n } from "../i18n";
import {
  FiHome,
  FiSearch,
  FiShuffle,
  FiCompass,
  FiList,
  FiHelpCircle,
  FiHeadphones,
  FiInfo,
  FiHeart,
  FiDownload,
  FiPlus,
  FiUpload,
  FiImage,
  FiVideo,
  FiMic,
  FiGrid,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export type Page =
  | "home"
  | "search"
  | "random"
  | "explore"
  | "artists"
  | "karaokePlaylist"
  | "karaokeQuiz"
  | "listenTogether"
  | "radio"
  | "about"
  | "favorites"
  | "downloads"
  | "playlists"
  | "uploaded"
  | "artGallery"
  | "videoLibrary"
  | "audioClips"
  | "communityCanvas"
  | "quotes"
  | "settings";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  accentColor: string;
  baseTheme: "light" | "dark";
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: Page;
  icon: React.ElementType;
  labelKey: string;
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ currentPage, onPageChange, accentColor, baseTheme, sidebarCollapsed, onToggleCollapse }, ref) => {
    const { t } = useI18n();

    const mainMenu: MenuItem[] = [
      { id: "home", icon: FiHome, labelKey: "sidebar.home" },
      { id: "search", icon: FiSearch, labelKey: "sidebar.search" },
      { id: "random", icon: FiShuffle, labelKey: "sidebar.random" },
      { id: "explore", icon: FiCompass, labelKey: "sidebar.explore" },
      { id: "karaokePlaylist", icon: FiList, labelKey: "sidebar.karaokePlaylist" },
      { id: "karaokeQuiz", icon: FiHelpCircle, labelKey: "sidebar.karaokeQuiz" },
      { id: "listenTogether", icon: FiHeadphones, labelKey: "sidebar.listenTogether" },
      { id: "about", icon: FiInfo, labelKey: "sidebar.about" },
    ];

    const libraryItems: MenuItem[] = [
      { id: "favorites", icon: FiHeart, labelKey: "sidebar.favorites" },
      { id: "downloads", icon: FiDownload, labelKey: "sidebar.downloads" },
      { id: "playlists", icon: FiList, labelKey: "sidebar.playlists" },
      { id: "uploaded", icon: FiUpload, labelKey: "sidebar.uploaded" },
    ];

    const otherItems: MenuItem[] = [
      { id: "artGallery", icon: FiImage, labelKey: "sidebar.artGallery" },
      { id: "videoLibrary", icon: FiVideo, labelKey: "sidebar.videoLibrary" },
      { id: "audioClips", icon: FiMic, labelKey: "sidebar.audioClips" },
      { id: "communityCanvas", icon: FiGrid, labelKey: "sidebar.communityCanvas" },
      { id: "quotes", icon: FiMessageSquare, labelKey: "sidebar.quotes" },
    ];

    const renderMenuItem = (item: MenuItem) => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;

      return (
        <Button
          key={item.id}
          data-page={item.id}
          variant="ghost"
          justifyContent={sidebarCollapsed ? "center" : "flex-start"}
          leftIcon={<Icon size={18} />}
          bg={isActive ? `${accentColor}20` : undefined}
          color={isActive ? accentColor : baseTheme === "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
          _hover={{
            bg: isActive ? `${accentColor}30` : baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
          }}
          size="sm"
          fontSize="sm"
          fontWeight="normal"
          py={2}
          px={sidebarCollapsed ? 2 : 3}
          h="auto"
          onClick={() => onPageChange(item.id)}
          transition="all 0.2s ease"
        >
          {!sidebarCollapsed && (
            <Text flex={1} textAlign="left">
              {t(item.labelKey)}
            </Text>
          )}
          {!sidebarCollapsed && item.id === "playlists" && (
            <IconButton
              aria-label="Add playlist"
              icon={<FiPlus size={14} />}
              size="xs"
              variant="ghost"
              color={baseTheme === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
              _hover={{ color: accentColor }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          )}
        </Button>
      );
    };

    return (
      <VStack
        ref={ref}
        w={sidebarCollapsed ? "60px" : "280px"}
        h="full"
        bg={baseTheme === "dark" ? "#1a1a1a" : "#fafafa"}
        borderRightWidth="1px"
        borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
        align="stretch"
        gap={0}
        overflow="hidden"
        transition="width 0.3s ease"
        position="relative"
      >
        {/* Logo - Fixed */}
        <HStack px={sidebarCollapsed ? 2 : 4} py={4} borderBottomWidth="1px" borderColor={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"} justifyContent={sidebarCollapsed ? "center" : "flex-start"}>
          <Box
            w={8}
            h={8}
            borderRadius="md"
            bg={accentColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiMic size={20} color="#000" />
          </Box>
          {!sidebarCollapsed && (
            <Text fontSize="lg" fontWeight="bold" color={accentColor}>
              {t("app.title")}
            </Text>
          )}
        </HStack>

        {/* Scrollable Menu Area */}
        <Box
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          py={2}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          <VStack align="stretch" gap={1} w="full" px={sidebarCollapsed ? 1 : 2}>
            {mainMenu.map(renderMenuItem)}
          </VStack>

          {!sidebarCollapsed && <Box h="1px" bg={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"} my={2} mx={3} />}

          <VStack align="stretch" gap={1} w="full" px={sidebarCollapsed ? 1 : 2}>
            {!sidebarCollapsed && (
              <Text
                fontSize="xs"
                color={baseTheme === "dark" ? "whiteAlpha.400" : "blackAlpha.400"}
                textTransform="uppercase"
                letterSpacing="wider"
                px={3}
                py={2}
              >
                {t("sidebar.library")}
              </Text>
            )}
            {libraryItems.map(renderMenuItem)}
          </VStack>

          {!sidebarCollapsed && <Box h="1px" bg={baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100"} my={2} mx={3} />}

          <VStack align="stretch" gap={1} w="full" px={sidebarCollapsed ? 1 : 2}>
            {!sidebarCollapsed && (
              <Text
                fontSize="xs"
                color={baseTheme === "dark" ? "whiteAlpha.400" : "blackAlpha.400"}
                textTransform="uppercase"
                letterSpacing="wider"
                px={3}
                py={2}
              >
                {t("sidebar.others")}
              </Text>
            )}
            {otherItems.map(renderMenuItem)}
          </VStack>
        </Box>

        {/* Collapse Toggle Button */}
        <Box
          position="absolute"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
        >
          <Button
            variant="ghost"
            justifyContent="center"
            color={baseTheme === "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
            bg={baseTheme === "dark" ? "#1a1a1a" : "#fafafa"}
            _hover={{
              bg: baseTheme === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
            }}
            size="sm"
            py={2}
            px={2}
            h="auto"
            onClick={onToggleCollapse}
          >
            {sidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </Button>
        </Box>
      </VStack>
    );
  }
);

Sidebar.displayName = "Sidebar";

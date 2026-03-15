import { HStack, IconButton, Text } from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/core";
import { FiMaximize2, FiX } from "react-icons/fi";
import { useI18n } from "../i18n";

interface TitleBarProps {
  baseTheme: "light" | "dark";
}

// 最小化图标（下划线样式）
function MinimizeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="9" width="10" height="2" fill="currentColor" />
    </svg>
  );
}

export function TitleBar({ baseTheme }: TitleBarProps) {
  const { t } = useI18n();

  const bgColor = baseTheme === "light" ? "#f5f5f5" : "#252525";
  const textColor = baseTheme === "light" ? "#1a1a1a" : "white";
  const borderColor = baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.100";
  const buttonColor = baseTheme === "light" ? "blackAlpha.700" : "whiteAlpha.800";
  const buttonHoverBg = baseTheme === "light" ? "blackAlpha.100" : "whiteAlpha.200";

  const handleMinimize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await invoke("minimize_window");
    } catch (error) {
      console.error("最小化窗口失败:", error);
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await invoke("maximize_window");
    } catch (error) {
      console.error("最大化窗口失败:", error);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await invoke("close_window");
    } catch (error) {
      console.error("关闭窗口失败:", error);
    }
  };

  const handleMouseDown = async () => {
    try {
      await invoke("start_dragging");
    } catch (error) {
      console.error("拖拽窗口失败:", error);
    }
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <HStack
      w="full"
      h="40px"
      pl={4}
      pr={0}
      justify="space-between"
      align="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      onMouseDown={handleMouseDown}
      cursor="default"
      userSelect="none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <Text fontSize="sm" fontWeight="medium" color={textColor}>
        {t("app.title")}
      </Text>

      <HStack gap={1} style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <IconButton
          aria-label="Minimize"
          size="sm"
          variant="ghost"
          color={buttonColor}
          _hover={{ bg: buttonHoverBg }}
          onClick={handleMinimize}
          onMouseDown={handleButtonMouseDown}
          icon={<MinimizeIcon />}
        />

        <IconButton
          aria-label="Maximize"
          size="sm"
          variant="ghost"
          color={buttonColor}
          _hover={{ bg: buttonHoverBg }}
          onClick={handleMaximize}
          onMouseDown={handleButtonMouseDown}
          icon={<FiMaximize2 size={14} />}
        />

        <IconButton
          aria-label="Close"
          size="sm"
          variant="ghost"
          color="red.400"
          _hover={{ bg: "red.500", color: "white" }}
          onClick={handleClose}
          onMouseDown={handleButtonMouseDown}
          icon={<FiX size={16} />}
        />
      </HStack>
    </HStack>
  );
}

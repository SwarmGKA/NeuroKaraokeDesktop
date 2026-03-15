import { VStack, Box, Text, Card, CardBody } from "@chakra-ui/react";
import { useI18n } from "../i18n";

export function Downloads() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={8} p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {t("page.downloads")}
        </Text>
        <Text color="gray.400">下载管理</Text>
      </Box>

      <Card bg="whiteAlpha.50" borderColor="whiteAlpha.100" borderWidth="1px">
        <CardBody>
          <Text color="gray.300">下载列表</Text>
        </CardBody>
      </Card>
    </VStack>
  );
}

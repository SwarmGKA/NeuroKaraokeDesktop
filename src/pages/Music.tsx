import { VStack, Box, Text, Card, CardBody } from "@chakra-ui/react";

export function Music() {
  return (
    <VStack align="stretch" gap={8} p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          音乐库
        </Text>
        <Text color="gray.400">管理你的音乐收藏</Text>
      </Box>

      <Card bg="whiteAlpha.50" borderColor="whiteAlpha.100" borderWidth="1px">
        <CardBody>
          <Text color="gray.300">暂无音乐，请添加音乐文件。</Text>
        </CardBody>
      </Card>
    </VStack>
  );
}

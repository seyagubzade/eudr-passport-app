import { Table as ChakraTable, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  align?: "start" | "center" | "end";
  width?: string;
  cell: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
}

export function Table<T>({ columns, rows, rowKey, empty = "No rows." }: TableProps<T>) {
  return (
    <ChakraTable.ScrollArea>
      <ChakraTable.Root size="md" variant="line">
        <ChakraTable.Header>
          <ChakraTable.Row bg="#fafafa">
            {columns.map((column) => (
              <ChakraTable.ColumnHeader
                key={column.id}
                whiteSpace="nowrap"
                color="fg.muted"
                fontSize="xs"
                fontWeight="semibold"
                px="4"
                py="2.5"
                textAlign={column.align}
                width={column.width}
                borderColor="blackAlpha.100"
              >
                {column.header}
              </ChakraTable.ColumnHeader>
            ))}
          </ChakraTable.Row>
        </ChakraTable.Header>
        <ChakraTable.Body>
          {rows.length === 0 ? (
            <ChakraTable.Row>
              <ChakraTable.Cell colSpan={columns.length} textAlign="center" py="8">
                <Text color="fg.muted">{empty}</Text>
              </ChakraTable.Cell>
            </ChakraTable.Row>
          ) : (
            rows.map((row) => (
              <ChakraTable.Row key={rowKey(row)}>
                {columns.map((column) => (
                  <ChakraTable.Cell
                    key={column.id}
                    verticalAlign="middle"
                    px="4"
                    py="3.5"
                    textAlign={column.align}
                    fontSize="sm"
                    borderColor="blackAlpha.100"
                  >
                    {column.cell(row)}
                  </ChakraTable.Cell>
                ))}
              </ChakraTable.Row>
            ))
          )}
        </ChakraTable.Body>
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  );
}

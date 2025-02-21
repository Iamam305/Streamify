import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/ui/table';
import { Button } from '../atoms/ui/button';
import { Loader2 } from 'lucide-react';

type TableComponentProps = {
headers : {
    head:string,
    icon: React.ComponentType,
    onClick: () => void,
}[]

data: string[][]
isLoading?:boolean,
currentSortBy?:string,
}

const TableComponent = ({ headers, data, isLoading, currentSortBy }: TableComponentProps) => {
  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        No data to show
      </div>
    )
  }

  return (
    <Table className="border rounded-lg overflow-x-scroll lg:overflow-x-hidden">
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {headers.map((header, index) => (
            <TableHead key={index} className="font-semibold">
              <Button 
                variant="ghost" 
                className='p-2 h-auto hover:bg-muted flex items-center gap-2 w-full justify-between'
                onClick={header.onClick}
              >
                <span>{header.head}</span>
                <header.icon/>
                <span>{(isLoading && currentSortBy == header.head) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}</span>
              </Button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index} className="hover:bg-muted/50">
            {row.map((cell, cellIndex) => (
              <TableCell 
                key={cellIndex} 
                className="w-[200px] py-4"
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TableComponent
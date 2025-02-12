import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/ui/table';
import { Button } from '../atoms/ui/button';

type TableComponentProps = {
headers : {
    head:string,
    icon: React.ComponentType,
    onClick: () => void,
}[]

data: string[][]

}

const TableComponent = ({ headers, data }: TableComponentProps) => {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead key={index}>
              <Button variant="link" className='p-0' onClick={header.onClick}>
                {header.head}{" "}
               
                  <header.icon />
                
              </Button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {row.map((cell, cellIndex) => (
              <TableCell key={cellIndex} className="w-[200px]">{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TableComponent
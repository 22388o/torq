import DefaultButton from "../../buttons/Button";
import classNames from "classnames";
import {
  Filter20Regular as FilterIcon,
  Dismiss20Regular as RemoveIcon,
  AddSquare20Regular as AddFilterIcon,
} from "@fluentui/react-icons";
import React, {SetStateAction, useState} from "react";
import TorqSelect from "../../inputs/Select";

import './filter_popover.scoped.scss';
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {selectColumns, selectFilters, updateFilters} from "../tableSlice";
import {FilterFunctions, FilterInterface} from "../filter";
import NumberFormat from "react-number-format";
import {log} from "util";

const combinerOptions = [
  { value: "and", label: "And" },
  // { value: "or", label: "Or" },
];

const ffLabels = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  includes: 'Include',
  notInclude: 'Not include',
}

function getFilterFunctions(filterCategory: 'number' | 'string') {
  // @ts-ignore
  return Object.keys(FilterFunctions[filterCategory]).map((key: []) => {
    // @ts-ignore
    return {value: key, label: ffLabels[key]}
  })
}

type optionType = {value: string, label:string}

function FilterRow({index, rowValues, handleUpdateFilter}: {index: number, rowValues: FilterInterface, handleUpdateFilter: Function}) {

  let columnsMeta = useAppSelector(selectColumns) || [];

  let columnOptions = columnsMeta.slice().map((column: {key: string, heading: string}) => {
    return {value: column.key, label: column.heading}
  })

  columnOptions.sort((a: optionType, b: optionType) => {
    if(a.label < b.label) { return -1; }
    if(a.label > b.label) { return 1; }
    return 0;
  })

  let functionOptions = getFilterFunctions(rowValues.category)

  // @ts-ignore
  let combinerOption: optionType = combinerOptions.find((item: optionType) => item.value == rowValues.combiner)
  // @ts-ignore
  let keyOption: optionType = columnOptions.find((item: optionType) => item.value == rowValues.key)
  // @ts-ignore
  let funcOption: optionType = functionOptions.find((item: optionType) => item.value == rowValues.funcName)

  let rowData = {
    combiner: combinerOption,
    category: rowValues.category,
    func: funcOption,
    key: keyOption,
    param: rowValues.parameter,
  }

  const convertFilterData = (rowData: any): FilterInterface => {
    return {
      combiner: rowData.combiner.value,
      category: rowData.category,
      funcName: rowData.func.value,
      key: rowData.key.value,
      parameter: rowData.param,
    }
  }

  const handleCombinerChange = (item:any) => {
    handleUpdateFilter({
      ...convertFilterData(rowData),
      combiner: item.value
    }, index)
  }
  const handleKeyChange = (item:any) => {
    handleUpdateFilter({
      ...convertFilterData(rowData),
      key: item.value
    }, index)
  }
  const handleFunctionChange = (item:any) => {
    handleUpdateFilter({
      ...convertFilterData(rowData),
      funcName: item.value
    }, index)
  }
  const handleParamChange = (value: any) => {
    if (value.floatValue) {
      handleUpdateFilter({
        ...convertFilterData(rowData),
        parameter: value.floatValue
      }, index)
    }
  }

  return (
    <div className={classNames("filter-row", {first: !index})}>
      {(!index && (<div className="filter-combiner-container">Where</div>))}
      {(!!index && (
        <div className="combiner-container">
          <TorqSelect options={combinerOptions} value={rowData.combiner} onChange={handleCombinerChange}/>
        </div>)
      )}
      <div className="filter-key-container">
        <TorqSelect options={columnOptions} value={rowData.key} onChange={handleKeyChange}/>
      </div>
      <div className="filter-function-container">
        <TorqSelect options={functionOptions} value={rowData.func} onChange={handleFunctionChange} />
      </div>
      <div className="filter-parameter-container">
        <NumberFormat
          className={"torq-input-field"}
          thousandSeparator=',' value={rowData.param}
          onValueChange={handleParamChange}
        />
      </div>
      <div className="remove-filter">
        <RemoveIcon/>
      </div>
    </div>
  )
}

const FilterPopover = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const filters = useAppSelector(selectFilters)
  const dispatch = useAppDispatch();

  const handleUpdateFilter = (filter: FilterInterface, index: number) => {
     const updatedFilters = [
       ...filters.slice(0,index),
       filter,
        ...filters.slice(index+1, filters.length)
     ]
    dispatch(
      updateFilters( {filters: updatedFilters})
    )
  }

  return (
    <div onClick={() => setIsPopoverOpen(!isPopoverOpen)}
         className={classNames("torq-popover-button-wrapper")} >
      <DefaultButton text={"Filter"} icon={<FilterIcon/>} className={"collapse-tablet"}/>
      <div className={classNames("popover-wrapper", {"popover-open": isPopoverOpen})}
           onClick={(e) =>{
             e.stopPropagation()
           }}>
        <div className="filter-rows">
          {filters.map((filter, index) => {
            return (<FilterRow
              key={'filter-row-'+index}
              rowValues={filter}
              index={index}
              handleUpdateFilter={handleUpdateFilter}
            />)
          })}
        </div>
        <div className="buttons-row">
          <DefaultButton text={"Add filter"} icon={<AddFilterIcon/>} />
        </div>
      </div>
    </div>
  )
}

export default FilterPopover;

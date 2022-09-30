import { useDeferredValue, useEffect, useMemo, useState } from 'react';
//import db from '../../db.json';
import Item from './item';
import { v4 as uid } from 'uuid';

const options = {
    string: [['includes', 'содержать']],
    number: [['equally', 'равно'], ['more', 'больше'], ['less', 'меньше']],
    head: [['date', 'Дата'], ['name', 'Название'], ['count', 'Количество'], ['distance', 'Расстояние']]


}

const funcs = {
    equally: (a, b) => a === b,
    more: (a, b) => a > b,
    less: (a, b) => a < b,
}


export default function List() {
    const [db,setDb]=useState([]);

    const [date, setDate] = useState("2007-05-17");
    const [sort, setSort] = useState('name');
    const [sortUpDown, setSortUpDown] = useState(true);
    const [column, setColumn] = useState('name');
    const [criterion, setCriterion] = useState('more');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const positionsOnPage = 10;

    const serchDef = useDeferredValue(search);

    const sortToggle = () => setSortUpDown(state => !state);

    useEffect(()=>{
        fetch('http://localhost:5000/').then(data=>data.json()).then(setDb).catch(err=>alert('SERVER ERROR!'));
    },[])

    //FILTER
    const filters = useMemo(() =>
        <>
            <select onChange={event => { setColumn(event.target.value); setSearch(''); }} value={column}>
                {options.head.map(el => <option key={uid()} value={el[0]}>{el[1]}</option>)}
            </select>

            <select onChange={event => { setCriterion(event.target.value); setPage(1) }} value={criterion}>
                {options[column === 'name' ? 'string' : 'number'].map(el => <option key={uid()} value={el[0]}>{el[1]}</option>)}
            </select>

            <input
                type={'date'}
                onChange={event => { setDate(event.target.value); setPage(1) }}
                value={date} hidden={!(column == 'date')}
            />

            <input
                type={column === 'name' ? 'text' : 'number'}
                onChange={event => { setSearch(event.target.value); setPage(1) }}
                hidden={(column == 'date')}
                placeholder={column === 'name' ? 'текст для поиска' : 'число для условия'}
            />

        </>,
        [criterion, column, date])

    //THEAD
    const thead = useMemo(() =>
        <tr>
            {options.head.map(el =>
                <th
                    key={uid()}
                    onClick={() => el[0] !== 'date' && (setSort(el[0]) || sort == sortToggle())}
                   // onClick={() => el[0] !== 'date' && (setSort(state => { if (state !== el[0]) { sortToggle(); return el[0] } else return state }) || sort == sortToggle())}
                    style={el[0] !== 'date' ? { cursor: 'pointer', borderRadius: 5, backgroundColor: 'lightgrey', border: sort == el[0] ? "2px solid green" : "" } : {}}>
                    {el[1]} {sort == el[0] ? sortUpDown ? "🔻" : "🔺" : ''}
                </th>)}
        </tr>,
        [criterion, column, sortUpDown])


    //TBODY & (APPLY FILTERS & SORT) 
    const tbody = useMemo(() => db
        .filter(el => column === 'name'
            ? el.name.toLowerCase().includes(search.toLowerCase())//serach text
            : column === 'date'// with numbers or date
                ? funcs[criterion](new Date(el[column].split('T')[0]).getTime(), new Date(date).getTime())
                : funcs[criterion](el[column], search)
        )
        .sort((a, b) => sort === 'name' ? (sortUpDown ? a[sort].localeCompare(b[sort]) : b[sort].localeCompare(a[sort])) : (sortUpDown ? a[sort] - b[sort] : b[sort] - a[sort]))//sort
        .map((el, idx) => idx >= positionsOnPage * (page - 1) && idx < positionsOnPage * page ? <Item key={el.guid} {...el} /> : '')//add item
        ,
        [serchDef, column, criterion, page, sort, date, sortUpDown,db]);

    //PAGES
    const pages = useMemo(() => Array(Math.ceil(tbody.length / positionsOnPage)).fill('').map((el, idx) => <button key={uid()} onClick={() => setPage(idx + 1)} style={idx + 1 === page ? { backgroundColor: 'black', color: 'white' } : {}}>{idx + 1}</button>),
        [tbody])


    return (
        db.length>0?
        <>
            {filters}
            <table>
                <thead>
                    {thead}
                </thead>
                <tbody>
                    {tbody}
                </tbody>
            </table>
            {pages}
        </>
        :<h1>Loading</h1>
    )
    
}
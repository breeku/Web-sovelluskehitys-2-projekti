import React, { useState, useEffect, useContext } from 'react'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import InfiniteScroll from 'react-infinite-scroll-component'

import { getPopularParkingAreas } from '../../../services/parking'

import { MapContext } from '../../../context/map'

import Graph from '../Graph'
import Selected from '../Selected'

export default function Statistics() {
    const [statistics, setStatistics] = useState([])
    const [fromDate, setFromDate] = useState(
        new Date(new Date().setDate(new Date().getDate() - 1)),
    )
    const [toDate, setToDate] = useState(new Date())
    const [limit, setLimit] = useState(5)
    const [offset, setOffset] = useState(0)
    const [history, setHistory] = useState(null)
    const {
        mapState: { map },
        mapDispatch,
    } = useContext(MapContext)

    useEffect(() => {
        ; (async () => {
            const data = await getPopularParkingAreas(fromDate, toDate, limit, offset)
            offset > 0 ? setStatistics(stats => [...stats, ...data]) : setStatistics(data)
        })()
    }, [fromDate, toDate, limit, offset])

    const handleSelectParking = item => {
        if (item.uid === history?.uid) {
            setHistory(null)
        } else {
            setHistory({
                uid: item.uid,
                list: item.history,
                capacity_estimate: item.capacity_estimate,
            })
            const coords = item.geometry.coordinates[0][0].map(arr => [...arr].reverse()) // map and copy coords, then reverse the arr since they are geojson
            map.flyToBounds(coords, 19)
            const layer = Object.values(map._layers).find(
                layer => layer.feature?.properties.uid === item.uid,
            ) // probs bad
            mapDispatch({ type: 'HIGHLIGHT', payload: { highlight: layer } })
        }
    }

    return (
        <div style={{ width: 400 }}>
            <DatePicker
                selected={fromDate}
                onChange={date => (setOffset(0), setFromDate(date))}
            />
            <DatePicker
                selected={toDate}
                onChange={date => (setOffset(0), setToDate(date))}
            />
            <InfiniteScroll
                dataLength={statistics.length}
                next={() => setOffset(offset + limit)}
                hasMore={true}
                loader={<h4>Loading...</h4>}
                endMessage={<h4>No more results</h4>}
                height={200}>
                {statistics.map(item => (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            margin: 'auto',
                            flexDirection: 'column',
                        }}>
                        <div
                            style={{
                                backgroundColor: 'grey',
                                width: '100%',
                                cursor: 'pointer',
                                marginBottom: 5,
                                marginTop: 5,
                                height: 40,
                            }}
                            onClick={() => handleSelectParking(item)}>
                            [
                            {item.geometry.coordinates[0][0][0].map(
                                coord => ' ' + coord.toFixed(2) + ' ',
                            )}
                            ]
                            <br />
                            total: {item.parking_sum}
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
            {history?.list && (
                <>
                    <Selected
                        selected={{
                            uid: history.uid,
                            capacity_estimate: history.capacity_estimate,
                        }}
                    />
                    <Graph propsParkingHistory={history.list} />
                </>
            )}
        </div>
    )
}

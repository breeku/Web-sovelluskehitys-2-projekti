import React, { useState, useEffect, useContext } from 'react'

import { ParkingDataContext } from '../../../context/parking_data'

export default function Filter() {
    const {
        parkingDataState: { locations },
        parkingDataDispatch,
    } = useContext(ParkingDataContext)
    const maxCapacity = Math.max.apply(
        Math,
        locations.map(parking_space => {
            return parking_space.features[0].properties.capacity_estimate
        }),
    )
    const [slider, setSlider] = useState(0)
    const [checkbox, setCheckbox] = useState(true)
    const [operator, setOperator] = useState('more than')

    useEffect(() => {
        ; (() => {
            const copy = [...locations]
            let filtered = checkbox
                ? [...copy.filter(item => !item.features[0].properties.capacity_estimate)]
                : []

            if (operator === 'more than') {
                filtered.push(
                    ...copy.filter(
                        item =>
                            parseInt(item.features[0].properties.capacity_estimate) >
                            parseInt(slider),
                    ),
                )
            } else if (operator === 'less than') {
                filtered.push(
                    ...copy.filter(
                        item =>
                            parseInt(item.features[0].properties.capacity_estimate) <
                            parseInt(slider),
                    ),
                )
            } else if (operator === 'equal') {
                filtered.push(
                    ...copy.filter(
                        item =>
                            parseInt(item.features[0].properties.capacity_estimate) ===
                            parseInt(slider),
                    ),
                )
            }

            parkingDataDispatch({
                type: 'SET_FILTERED_LOCATIONS',
                payload: filtered,
            })
        })()
    }, [checkbox, locations, operator, parkingDataDispatch, slider])

    return (
        <div style={{ backgroundColor: 'white', padding: 10 }}>
            Filters:
            <br />
            Parking capacity (estimate):
            <br />
            <div className='disable' data-testid="filter" style={{ cursor: 'pointer' }}>
                <select onChange={e => setOperator(e.target.value)}>
                    <option value='more than'>More than</option>
                    <option value='less than'>Less than</option>
                    <option value='equal'>Equal</option>
                </select>
                <input
                    type='range'
                    min='0'
                    max={maxCapacity}
                    value={slider}
                    class='slider'
                    onChange={event => setSlider(event.target.value)}
                />
                <br />
                {slider}
                <br />
                Show unknown capacity estimate:{' '}
                <input
                    type='checkbox'
                    checked={checkbox}
                    onChange={event => setCheckbox(event.target.checked)}
                />
            </div>
        </div>
    )
}

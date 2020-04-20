import { render } from "enzyme"
import { prop } from "ramda"
import React from "react"
import Table, {
  addCommonRowData,
  createGroups,
  flattenGroups,
  RowType,
  ColumnDefinition,
  RowDefinitions,
  GroupDefinition,
} from "../Table"
import CAR_DATA from "../../../fixtures/CAR_DATA"

type ArrayInfer<T extends any[]> = T extends Array<infer U> ? U : never
type CarDatum = ArrayInfer<typeof CAR_DATA>

const columnDefinitions: ColumnDefinition<CarDatum>[] = [
  { dataKey: "car_make", label: "Car Make", flex: "1 0 100px" },
  { dataKey: "car_model", label: "Car Model", flex: "1 0 100px" },
  { dataKey: "car_year", label: "Car Year", flex: "0.5 0 50px" },
  { dataKey: "country", label: "Country", flex: "1 0 100px" },
  { dataKey: "car_price", label: "Price", flex: "1 0 100px" },
  { dataKey: "comments", label: "Comments", flex: "2 0 200px" },
]

const rowDefinitions: RowDefinitions<CarDatum> = {
  [RowType.Body]: {
    height: 48,
    keyFn: prop("id"),
  },
}

const groupDefinitions: GroupDefinition<CarDatum>[] = [prop("car_make")]

describe("render", () => {
  it("matches snapshot", () => {
    const wrapper = render(
      <Table
        data={CAR_DATA}
        initialDimensions={{
          height: 400,
          width: 1600,
        }}
        columnDefinitions={columnDefinitions}
        rowDefinitions={rowDefinitions}
        groupDefinitions={groupDefinitions}
      />
    )

    expect(wrapper).toMatchSnapshot()
  })
})

describe("createGroups", () => {
  const data = addCommonRowData(rowDefinitions, [
    {
      id: 3,
      country: "Kazakhstan",
      car_make: "Chevrolet",
      car_model: "Camaro",
      car_year: 1976,
      car_price: "$5602.92",
      comments: "e-enable synergistic e-markets",
    },
    {
      id: 11,
      country: "Brazil",
      car_make: "Cadillac",
      car_model: "Escalade EXT",
      car_year: 2006,
      car_price: "$7834.39",
      comments: "drive interactive systems",
    },
    {
      id: 12,
      country: "Philippines",
      car_make: "Ford",
      car_model: "Model T",
      car_year: 1909,
      car_price: "$8869.46",
      comments: "redefine seamless paradigms",
    },
    {
      id: 25,
      country: "Czech Republic",
      car_make: "Cadillac",
      car_model: "SRX",
      car_year: 2007,
      car_price: "$6722.29",
      comments: "repurpose front-end interfaces",
    },
    {
      id: 101,
      country: "Russia",
      car_make: "Cadillac",
      car_model: "Escalade EXT",
      car_year: 2002,
      car_price: "$7713.56",
      comments: "incentivize bricks-and-clicks deliverables",
    },
  ])

  describe("given an empty array of group functions", () => {
    it("is a noop", () => {
      expect(createGroups([], data)).toEqual(data)
    })
  })

  describe("given an array of group functions", () => {
    it("groups data", () => {
      expect(createGroups([prop("car_make")], data)).toEqual([
        {
          value: "Chevrolet",
          path: ["Chevrolet"],
          children: addCommonRowData(rowDefinitions, [
            {
              id: 3,
              country: "Kazakhstan",
              car_make: "Chevrolet",
              car_model: "Camaro",
              car_year: 1976,
              car_price: "$5602.92",
              comments: "e-enable synergistic e-markets",
            },
          ]),
        },
        {
          value: "Cadillac",
          path: ["Cadillac"],
          children: addCommonRowData(rowDefinitions, [
            {
              id: 11,
              country: "Brazil",
              car_make: "Cadillac",
              car_model: "Escalade EXT",
              car_year: 2006,
              car_price: "$7834.39",
              comments: "drive interactive systems",
            },
            {
              id: 25,
              country: "Czech Republic",
              car_make: "Cadillac",
              car_model: "SRX",
              car_year: 2007,
              car_price: "$6722.29",
              comments: "repurpose front-end interfaces",
            },
            {
              id: 101,
              country: "Russia",
              car_make: "Cadillac",
              car_model: "Escalade EXT",
              car_year: 2002,
              car_price: "$7713.56",
              comments: "incentivize bricks-and-clicks deliverables",
            },
          ]),
        },
        {
          value: "Ford",
          path: ["Ford"],
          children: addCommonRowData(rowDefinitions, [
            {
              id: 12,
              country: "Philippines",
              car_make: "Ford",
              car_model: "Model T",
              car_year: 1909,
              car_price: "$8869.46",
              comments: "redefine seamless paradigms",
            },
          ]),
        },
      ])
    })

    it("recursively groups data", () => {
      expect(createGroups([prop("car_make"), prop("car_model")], data)).toEqual(
        [
          {
            value: "Chevrolet",
            path: ["Chevrolet"],
            children: [
              {
                value: "Camaro",
                path: ["Chevrolet", "Camaro"],
                children: addCommonRowData(rowDefinitions, [
                  {
                    id: 3,
                    country: "Kazakhstan",
                    car_make: "Chevrolet",
                    car_model: "Camaro",
                    car_year: 1976,
                    car_price: "$5602.92",
                    comments: "e-enable synergistic e-markets",
                  },
                ]),
              },
            ],
          },
          {
            value: "Cadillac",
            path: ["Cadillac"],
            children: [
              {
                value: "Escalade EXT",
                path: ["Cadillac", "Escalade EXT"],
                children: addCommonRowData(rowDefinitions, [
                  {
                    id: 11,
                    country: "Brazil",
                    car_make: "Cadillac",
                    car_model: "Escalade EXT",
                    car_year: 2006,
                    car_price: "$7834.39",
                    comments: "drive interactive systems",
                  },
                  {
                    id: 101,
                    country: "Russia",
                    car_make: "Cadillac",
                    car_model: "Escalade EXT",
                    car_year: 2002,
                    car_price: "$7713.56",
                    comments: "incentivize bricks-and-clicks deliverables",
                  },
                ]),
              },
              {
                value: "SRX",
                path: ["Cadillac", "SRX"],
                children: addCommonRowData(rowDefinitions, [
                  {
                    id: 25,
                    country: "Czech Republic",
                    car_make: "Cadillac",
                    car_model: "SRX",
                    car_year: 2007,
                    car_price: "$6722.29",
                    comments: "repurpose front-end interfaces",
                  },
                ]),
              },
            ],
          },
          {
            value: "Ford",
            path: ["Ford"],
            children: [
              {
                value: "Model T",
                path: ["Ford", "Model T"],
                children: addCommonRowData(rowDefinitions, [
                  {
                    id: 12,
                    country: "Philippines",
                    car_make: "Ford",
                    car_model: "Model T",
                    car_year: 1909,
                    car_price: "$8869.46",
                    comments: "redefine seamless paradigms",
                  },
                ]),
              },
            ],
          },
        ]
      )
    })
  })
})

describe("flattenGroups", () => {
  const data = addCommonRowData(rowDefinitions, [
    {
      id: 3,
      country: "Kazakhstan",
      car_make: "Chevrolet",
      car_model: "Camaro",
      car_year: 1976,
      car_price: "$5602.92",
      comments: "e-enable synergistic e-markets",
    },
    {
      id: 11,
      country: "Brazil",
      car_make: "Cadillac",
      car_model: "Escalade EXT",
      car_year: 2006,
      car_price: "$7834.39",
      comments: "drive interactive systems",
    },
    {
      id: 12,
      country: "Philippines",
      car_make: "Ford",
      car_model: "Model T",
      car_year: 1909,
      car_price: "$8869.46",
      comments: "redefine seamless paradigms",
    },
    {
      id: 25,
      country: "Czech Republic",
      car_make: "Cadillac",
      car_model: "SRX",
      car_year: 2007,
      car_price: "$6722.29",
      comments: "repurpose front-end interfaces",
    },
    {
      id: 101,
      country: "Russia",
      car_make: "Cadillac",
      car_model: "Escalade EXT",
      car_year: 2002,
      car_price: "$7713.56",
      comments: "incentivize bricks-and-clicks deliverables",
    },
  ])

  describe("given flat data", () => {
    it("is a noop", () => {
      expect(flattenGroups(data)).toEqual(data)
    })
  })

  describe("given a single grouping fn", () => {
    it("flattens the group into rows", () => {
      expect(flattenGroups(createGroups([prop("car_make")], data))).toEqual([
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Chevrolet"]),
          label: "Chevrolet",
          depth: 0,
        },
        {
          type: RowType.Body,
          id: 3,
          country: "Kazakhstan",
          car_make: "Chevrolet",
          car_model: "Camaro",
          car_year: 1976,
          car_price: "$5602.92",
          comments: "e-enable synergistic e-markets",
          height: 48,
          key: 3,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Cadillac"]),
          label: "Cadillac",
          depth: 0,
        },
        {
          type: RowType.Body,
          id: 11,
          country: "Brazil",
          car_make: "Cadillac",
          car_model: "Escalade EXT",
          car_year: 2006,
          car_price: "$7834.39",
          comments: "drive interactive systems",
          height: 48,
          key: 11,
        },
        {
          type: RowType.Body,
          id: 25,
          country: "Czech Republic",
          car_make: "Cadillac",
          car_model: "SRX",
          car_year: 2007,
          car_price: "$6722.29",
          comments: "repurpose front-end interfaces",
          height: 48,
          key: 25,
        },
        {
          type: RowType.Body,
          id: 101,
          country: "Russia",
          car_make: "Cadillac",
          car_model: "Escalade EXT",
          car_year: 2002,
          car_price: "$7713.56",
          comments: "incentivize bricks-and-clicks deliverables",
          height: 48,
          key: 101,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Ford"]),
          label: "Ford",
          depth: 0,
        },
        {
          type: RowType.Body,
          id: 12,
          country: "Philippines",
          car_make: "Ford",
          car_model: "Model T",
          car_year: 1909,
          car_price: "$8869.46",
          comments: "redefine seamless paradigms",
          height: 48,
          key: 12,
        },
      ])
    })
  })
  describe("given multiple grouping fns", () => {
    it("flattens the group into rows", () => {
      expect(
        flattenGroups(createGroups([prop("car_make"), prop("car_model")], data))
      ).toEqual([
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Chevrolet"]),
          label: "Chevrolet",
          depth: 0,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Chevrolet", "Camaro"]),
          label: "Camaro",
          depth: 1,
        },
        {
          type: RowType.Body,
          id: 3,
          country: "Kazakhstan",
          car_make: "Chevrolet",
          car_model: "Camaro",
          car_year: 1976,
          car_price: "$5602.92",
          comments: "e-enable synergistic e-markets",
          height: 48,
          key: 3,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Cadillac"]),
          label: "Cadillac",
          depth: 0,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Cadillac", "Escalade EXT"]),
          label: "Escalade EXT",
          depth: 1,
        },
        {
          type: RowType.Body,
          id: 11,
          country: "Brazil",
          car_make: "Cadillac",
          car_model: "Escalade EXT",
          car_year: 2006,
          car_price: "$7834.39",
          comments: "drive interactive systems",
          height: 48,
          key: 11,
        },
        {
          type: RowType.Body,
          id: 101,
          country: "Russia",
          car_make: "Cadillac",
          car_model: "Escalade EXT",
          car_year: 2002,
          car_price: "$7713.56",
          comments: "incentivize bricks-and-clicks deliverables",
          height: 48,
          key: 101,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Cadillac", "SRX"]),
          label: "SRX",
          depth: 1,
        },
        {
          type: RowType.Body,
          id: 25,
          country: "Czech Republic",
          car_make: "Cadillac",
          car_model: "SRX",
          car_year: 2007,
          car_price: "$6722.29",
          comments: "repurpose front-end interfaces",
          height: 48,
          key: 25,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Ford"]),
          label: "Ford",
          depth: 0,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: JSON.stringify(["Ford", "Model T"]),
          label: "Model T",
          depth: 1,
        },
        {
          type: RowType.Body,
          id: 12,
          country: "Philippines",
          car_make: "Ford",
          car_model: "Model T",
          car_year: 1909,
          car_price: "$8869.46",
          comments: "redefine seamless paradigms",
          height: 48,
          key: 12,
        },
      ])
    })
  })
})

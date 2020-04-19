import { render } from "enzyme"
import { prop } from "ramda"
import React from "react"
import Table, {
  addCommonRowData,
  createGroups,
  flattenGroups,
  RowType,
} from "../Table"

describe("render", () => {
  it("matches snapshot", () => {
    const wrapper = render(
      <Table
        initialDimensions={{
          height: 400,
          width: 1600,
        }}
      />
    )

    expect(wrapper).toMatchSnapshot()
  })
})

describe("createGroups", () => {
  const data = addCommonRowData([
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
          groupValue: "Chevrolet",
          groupParents: ["Chevrolet"],
          groupData: addCommonRowData([
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
          groupValue: "Cadillac",
          groupParents: ["Cadillac"],
          groupData: addCommonRowData([
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
          groupValue: "Ford",
          groupParents: ["Ford"],
          groupData: addCommonRowData([
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
            groupValue: "Chevrolet",
            groupParents: ["Chevrolet"],
            groupData: [
              {
                groupValue: "Camaro",
                groupParents: ["Chevrolet", "Camaro"],
                groupData: addCommonRowData([
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
            groupValue: "Cadillac",
            groupParents: ["Cadillac"],
            groupData: [
              {
                groupValue: "Escalade EXT",
                groupParents: ["Cadillac", "Escalade EXT"],
                groupData: addCommonRowData([
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
                groupValue: "SRX",
                groupParents: ["Cadillac", "SRX"],
                groupData: addCommonRowData([
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
            groupValue: "Ford",
            groupParents: ["Ford"],
            groupData: [
              {
                groupValue: "Model T",
                groupParents: ["Ford", "Model T"],
                groupData: addCommonRowData([
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
  const data = addCommonRowData([
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
          key: "Chevrolet",
          label: "Chevrolet",
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
          key: "Cadillac",
          label: "Cadillac",
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
          key: "Ford",
          label: "Ford",
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
  describe("given multiple grouping fns", () => {
    it("flattens the group into rows", () => {
      // const temp = flattenGroups(
      //   createGroups(
      //     [prop("car_make"), prop("car_model"), prop("car_year")],
      //     data
      //   )
      // )
      // console.log("temp", temp)
      expect(
        flattenGroups(createGroups([prop("car_make"), prop("car_model")], data))
      ).toEqual([
        {
          type: RowType.GroupHeader,
          height: 48,
          key: "Chevrolet",
          label: "Chevrolet",
          depth: 1,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: "Chevrolet::Camaro",
          label: "Camaro",
          depth: 2,
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
          key: "Cadillac",
          label: "Cadillac",
          depth: 1,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: "Cadillac::Escalade EXT",
          label: "Escalade EXT",
          depth: 2,
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
          key: "Cadillac::SRX",
          label: "SRX",
          depth: 2,
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
          key: "Ford",
          label: "Ford",
          depth: 1,
        },
        {
          type: RowType.GroupHeader,
          height: 48,
          key: "Ford::Model T",
          label: "Model T",
          depth: 2,
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

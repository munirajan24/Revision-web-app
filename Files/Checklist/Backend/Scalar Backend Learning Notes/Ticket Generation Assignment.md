# Ticket Generation: Layered Implementation Exercise

Source: [Notes_PL_Implementation.pdf](<../../Scalar java backend contents/Notes_PL_Implementation.pdf>) (1 page)

The page sketches a parking/entry ticket use case and its collaborating layers. It names a ticket-generation request, vehicle and gate repositories, a bill service, and a fee-calculation strategy. This guide turns the sketch into an implementation sequence while keeping the source's layering intact.

## 1. Request flow and responsibilities

The source recommends starting with the domain models, creating them through constructors or within the owning class. It also notes that common helper classes (for example, command classes) can be built once and reused across features.

```text
Client
  -> BillController
  -> BillService
       -> EntryGateRepository
       -> VehicleRepository
       -> FeesCalculatorStrategy
       -> BillRepository
```

- **Controller:** receives the HTTP/CLI request, validates transport-level fields, calls the service, and maps the result to a response.
- **Service:** coordinates the use case and business rules. It should not contain HTTP parsing or persistence details.
- **Repositories:** load and save the domain records.
- **Fee strategy:** calculates fees according to the policy for a vehicle type, gate, or duration.
- **DTOs:** describe input/output at the boundary. They are not database entities.
- **Models/entities:** represent domain or persisted data.

Keep orchestration in the service. Inject the repositories and strategy rather than constructing them inside the method; this keeps dependencies replaceable and testable.

## 2. Request and domain data

The source names `GenerateTicketRequestDto` with:

```text
entry_gate_id
vehicle_type
vehicle_number
```

A clean domain starting point might include:

- **EntryGate:** gate ID and its configuration/location.
- **Vehicle:** vehicle ID, vehicle type, and normalized vehicle number.
- **Ticket/Bill:** generated ID, entry gate, vehicle, entry time, fee or fee status, and lifecycle state.

The exact field names and whether ticket and bill are separate models are not fully specified in the one-page source; choose what the assignment requires rather than treating this example as a required schema.

## 3. Implement `generateTicket` in stages

1. **Define the boundary.** Create the request DTO with required fields. Reject missing IDs, unsupported vehicle types, and malformed vehicle numbers at the controller/API boundary.
2. **Load the gate.** Use `EntryGateRepository` to find `entry_gate_id`; return a clear not-found error if it does not exist.
3. **Create or load the vehicle.** Apply the assignment's vehicle-number uniqueness/normalization rule. The source suggests saving via `VehicleRepository`, while noting that persistence may be skipped if necessary for the exercise.
4. **Select the fee policy.** Ask `FeesCalculatorStrategy` for the applicable fee behavior; do not embed a growing `if/else` fee table in the controller.
5. **Create the ticket/bill.** Populate required values from validated domain data, including a consistent entry time and status.
6. **Persist the result.** Save through `BillRepository` (and the vehicle repository if required).
7. **Return a response DTO.** Include the generated ticket/bill identifier and the result needed by the caller without returning a persistence entity directly.

If saving the vehicle and bill must succeed together, wrap the changes in an appropriate database transaction. If a separate external service is involved, a database transaction cannot automatically make that external side effect atomic.

## 4. Fee calculation as a strategy

The **Strategy** pattern represents interchangeable fee rules behind a common interface:

```java
interface FeesCalculatorStrategy {
    Money calculate(Vehicle vehicle, EntryGate gate, Instant entryTime);
}
```

Different implementations can vary by vehicle type or business policy. Prefer a domain `Money` value (amount plus currency/scale rules) over floating-point arithmetic for real financial calculations. The assignment may use a simpler numeric type, but rounding should still be specified.

The source names the fee-calculation strategy but does not show enough on its single page to infer the exact rate table or formula. Keep that policy explicit and use the exercise requirements for its concrete rules.

## 5. Error handling and invariants

Consider these outcomes explicitly:

- Unknown entry gate.
- Missing or invalid vehicle data.
- Unsupported vehicle type.
- Vehicle already registered or an entry already active, if the domain requires uniqueness.
- Fee strategy unable to calculate for the supplied case.
- Persistence failure while writing the bill.
- Duplicate request after a client retry.

Use the application's standard error/exception pattern. Do not return a success-shaped ticket when a required lookup or persistence step fails.

## 6. Tests to write

### Service unit tests

- Valid request loads the gate and calculates the fee.
- Unsupported vehicle type is rejected by the policy.
- Missing gate returns the expected domain error.
- Repository failure is surfaced; the service does not report success.
- Verify the returned bill uses the requested vehicle and gate.

### Controller/API tests

- Missing fields and malformed input are rejected.
- A valid request maps to the expected response DTO and status.
- Domain errors map to the API's documented error response.

### Persistence/integration tests

- Foreign-key and uniqueness constraints behave as expected.
- Ticket/bill and vehicle writes roll back together when transactionally required.
- Repeated requests behave according to an explicit idempotency policy.

## Quick self-check

1. Which layer should orchestrate gate lookup, vehicle handling, fee calculation, and bill persistence?
2. Why should fee calculation be behind a strategy interface?
3. What belongs in the request DTO, and what belongs in a persisted entity?
4. Which operations need a transaction if ticket generation spans multiple writes?
5. How should the system behave if the gate is missing or bill persistence fails?

## Source page guide

- [Page 1](<../../Scalar java backend contents/Notes_PL_Implementation.pdf#page=1>): layered request flow, models/DTOs, repositories, `GenerateTicketRequestDto`, `BillService`, and fee-calculation strategy.

The PDF is one page and presents an implementation sketch, not a complete specification. Use the assignment's tests or full problem statement for exact class signatures, fee rules, and persistence requirements.

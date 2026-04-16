import Types "../types";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Order "mo:core/Order";

module {
  // Generate a simple unique id from a counter and timestamp
  public func newId(counter : Nat, ts : Int) : Text {
    "gen-" # counter.toText() # "-" # ts.toText()
  };

  // Retrieve all generations for a user, sorted newest first, limited to `limit`
  public func listForUser(
    generations : Map.Map<Text, Types.Generation>,
    userId : Principal,
    limit : Nat,
  ) : [Types.Generation] {
    // Collect matching generations
    var matched : [Types.Generation] = [];
    for ((_, gen) in generations.entries()) {
      if (Principal.equal(gen.userId, userId)) {
        matched := matched.concat([gen]);
      };
    };
    // Sort descending by createdAt
    let sorted = matched.sort(
      func(a : Types.Generation, b : Types.Generation) : Order.Order {
        if (a.createdAt > b.createdAt) #less
        else if (a.createdAt < b.createdAt) #greater
        else #equal
      },
    );
    if (limit == 0 or sorted.size() <= limit) sorted
    else sorted.sliceToArray(0, limit)
  };

  // Count all generations across all users
  public func countAll(generations : Map.Map<Text, Types.Generation>) : Nat {
    generations.size()
  };

  // Count distinct active users (those who have at least one generation)
  public func countActiveUsers(
    profiles : Map.Map<Text, Types.UserProfile>
  ) : Nat {
    profiles.size()
  };
};

import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import Voting from "@/components/Voting.vue";

describe("Voting.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(Voting, {
      propsData: { msg }
    });
    expect(wrapper.text()).to.include(msg);
  });
});

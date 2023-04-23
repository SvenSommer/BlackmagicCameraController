
from models.command import Command


class ParameterHandler:
    def __init__(self, parameter) -> None:
        self.parameter = parameter
        self.integer_types = ['int64', 'int32', 'int16', 'int8']

    def printMinAndMax(self):
        if "minimum" not in self.parameter:
            return
        if self.parameter['type'] in "fixed16":
            min = self.to_fixed(self.parameter["minimum"], 16)
            max = self.to_fixed(self.parameter["maximum"], 16)
            print("{0}: {1} ({2})".format(
                "Minimum", min, self.parameter["minimum"]))
            print("{0}: {1} ({2})".format(
                "Maximum", max, self.parameter["maximum"]))
        else:
            print("{0}: {1}".format("Minimum", self.parameter["minimum"]))
            print("{0}: {1}".format("Maximum", self.parameter["maximum"]))

    def printParamInfo(self):
        if len(self.parameter['index']) == 0:
            print("Parameter has to be an {0} between:".format(
                self.parameter['type']))
        else:
            print("Parameter consists of {0} sub parameters. These are '{1}'".format(
                len(self.parameter['index']), "', '".join(self.parameter['index'])))
        self.printMinAndMax()
        if "interpretation" in self.parameter and self.parameter['interpretation'] != "":
            print("Interpretation: {0}".format(
                self.parameter['interpretation']))

    def checkParameter(self, parameter_value):
        if "minimum" in self.parameter:
            if parameter_value < self.parameter['minimum']:
                _ = input("ERROR: Value to low. Minumum value is {0}".format(
                    self.parameter['minimum']))
                return False
        if "maximum" in self.parameter:
            if parameter_value > self.parameter['maximum']:
                _ = input("ERROR: Value to high. Maximum value is {0}".format(
                    self.parameter['maximum']))
                return False
        return True

    def getParameterInput(self, command: Command, name):
        try:
            if self.parameter['type'] in self.integer_types:
                parameter_value = int(
                    input("Please specify parameter {0}:".format(name)))
            elif self.parameter['type'] in "fixed16":
                parameter_value = self.to_float(
                    int(input("Please specify parameter {0}:".format(name))), 16)
            elif self.parameter['type'] in "string":
                parameter_value = str(
                    input("Please specify parameter {0}:".format(name)))
            elif self.parameter['type'] in "boolean":
                user_input = str(
                    input("Please specify parameter {0} ([true] or [false]):".format(name)))
                if user_input not in ["true", "false"]:
                    print("ERROR: Your input is not a allowed value")
                    self.handleParam(command)
                if user_input == "true":
                    parameter_value = 1
                else:
                    parameter_value = 0
            elif self.parameter['type'] in "uint16_bit_field":
                user_input = int(
                    input("Please specify parameter {0}([0] or [1]):".format(name)))
                if user_input not in [0, 1]:
                    print("ERROR: Your input is not a allowed value")
                    self.handleParam(command)
                parameter_value = user_input
            elif self.parameter['type'] in "void":
                parameter_value = int(
                    input("Do you want to send this command? Type '1' an hit Enter!"))
            else:
                print("Error: unknown parametertype: {0}".format(
                    self.parameter['type']))
                exit(1)
            return parameter_value

        except ValueError:
            print("Input is not a {0}".format(self.parameter['type']))
            self.handleParam(command)

    def handleParam(self, command: Command) -> Command:
        self.printParamInfo()
        if len(self.parameter['index']) == 0:
            parameter_value = self.getParameterInput(
                command, "'{0}'".format(self.parameter['parameter']))
            if self.checkParameter(parameter_value):
                command.set_value(parameter_value)

            else:
                self.handleParam(command)
        else:
            for subparam in self.parameter['index']:
                parameter_subvalue = self.getParameterInput(
                    command, "'{0}' from '{1}'".format(subparam, self.parameter['parameter']))
                if self.checkParameter(parameter_subvalue):
                    command.add_value(parameter_subvalue)
                else:
                    self.handleParam(command)

        return command

    """
    f is the input floating point number 
    e is the number of fractional bits in the Q format. 
        Example in Q1.15 format e = 15
    """

    def to_fixed(self, f, e):
        a = f * (2**e)
        b = int(round(a))
        if a < 0:
            # next three lines turns b into it's 2's complement.
            b = abs(b)
            b = ~b
            b = b + 1
        return b

    """
    x is the input fixed number which is of integer datatype
    e is the number of fractional bits for example in Q1.15 e = 15
    """

    def to_float(self, x, e):
        c = abs(x)
        sign = 1
        if x < 0:
            # convert back from two's complement
            c = x - 1
            c = ~c
            sign = -1
        f = (1.0 * c) / (2 ** e)
        f = f * sign
        return f
